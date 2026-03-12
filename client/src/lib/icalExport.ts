import type { FamilyEvent, CareSlot, Member, Child, Category } from '@/types/family'

const DAYS_ICAL = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const

/**
 * Format a Date object to iCalendar DTSTART/DTEND value (local time).
 * Returns e.g. "20260312T083000"
 */
function formatDateTime(date: Date, time: string): string {
  const [h, m] = time.split(':').map(Number)
  const y = String(date.getFullYear())
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${mo}${d}T${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}00`
}

/** Escape special characters in iCalendar text fields */
function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/** Generate a stable UID for an event/slot */
function uid(id: string, familyId: string): string {
  return `${id}@family-planner-${familyId}`
}

/**
 * Build the RRULE string for a given recurrence + day set.
 */
function buildRRule(recurrence: 'daily' | 'weekly' | 'biweekly', days: number[], endDate?: string): string {
  const parts: string[] = []

  if (recurrence === 'daily') {
    parts.push('FREQ=DAILY')
  } else if (recurrence === 'weekly') {
    parts.push('FREQ=WEEKLY')
    const byDay = days.map((d) => DAYS_ICAL[d]).join(',')
    if (byDay) parts.push(`BYDAY=${byDay}`)
  } else if (recurrence === 'biweekly') {
    parts.push('FREQ=WEEKLY')
    parts.push('INTERVAL=2')
    const byDay = days.map((d) => DAYS_ICAL[d]).join(',')
    if (byDay) parts.push(`BYDAY=${byDay}`)
  }

  if (endDate) {
    const cleaned = endDate.replace(/-/g, '')
    parts.push(`UNTIL=${cleaned}T235959`)
  }

  return parts.join(';')
}

/**
 * Find the next occurrence date from today that matches one of the given day-of-week numbers.
 */
function nextMatchingDate(days: number[]): Date {
  const now = new Date()
  for (let offset = 0; offset < 7; offset++) {
    const candidate = new Date(now)
    candidate.setDate(now.getDate() + offset)
    if (days.includes(candidate.getDay())) {
      return candidate
    }
  }
  return now
}

interface VEvent {
  uid: string
  summary: string
  dtStart: string
  dtEnd: string
  rrule: string
  description?: string
  categories?: string
  color?: string
}

function renderVEvent(evt: VEvent): string {
  const lines: string[] = [
    'BEGIN:VEVENT',
    `UID:${evt.uid}`,
    `DTSTAMP:${formatDateTime(new Date(), '00:00').replace(/T\d+/, 'T' + new Date().toISOString().slice(11, 19).replace(/:/g, ''))}`,
    `DTSTART:${evt.dtStart}`,
    `DTEND:${evt.dtEnd}`,
    `SUMMARY:${escapeText(evt.summary)}`,
  ]
  if (evt.rrule) {
    lines.push(`RRULE:${evt.rrule}`)
  }
  if (evt.description) {
    lines.push(`DESCRIPTION:${escapeText(evt.description)}`)
  }
  if (evt.categories) {
    lines.push(`CATEGORIES:${escapeText(evt.categories)}`)
  }
  if (evt.color) {
    lines.push(`X-APPLE-CALENDAR-COLOR:${evt.color}`)
  }
  lines.push('END:VEVENT')
  return lines.join('\r\n')
}

export type ExportScope = 'family' | 'member' | 'child'

/**
 * Generate a complete .ics string from family data.
 *
 * @param events - all family events (Record or array)
 * @param careSlots - all care slots (Record or array)
 * @param members - all family members (Record)
 * @param children - all children (Record)
 * @param categories - all categories (Record)
 * @param scope - 'family' | 'member' | 'child'
 * @param filterId - memberId or childId when scope is 'member' or 'child'
 * @param familyId - the family ID (used for UIDs)
 */
export function generateICS(
  events: Record<string, FamilyEvent> | FamilyEvent[],
  careSlots: Record<string, CareSlot> | CareSlot[],
  members: Record<string, Member>,
  children: Record<string, Child>,
  categories: Record<string, Category>,
  scope: ExportScope,
  filterId?: string,
  familyId: string = 'default',
): string {
  const eventList = Array.isArray(events) ? events : Object.values(events)
  const slotList = Array.isArray(careSlots) ? careSlots : Object.values(careSlots)

  // Filter events by scope
  let filteredEvents = eventList
  let filteredSlots = slotList

  if (scope === 'member' && filterId) {
    filteredEvents = eventList.filter((e) => e.memberId === filterId)
    filteredSlots = slotList.filter((s) => s.assignedTo === filterId || s.assignedTo === 'both')
  } else if (scope === 'child' && filterId) {
    filteredEvents = [] // children don't own events
    filteredSlots = slotList.filter((s) => s.childId === filterId)
  }

  const vevents: string[] = []

  // Convert family events to VEVENTs
  for (const evt of filteredEvents) {
    const member = members[evt.memberId]
    const category = categories[evt.categoryId]
    const startDate = nextMatchingDate(evt.days)
    const prefix = category ? `${category.emoji} ` : ''
    const summary = `${prefix}${evt.title}`
    const description = member ? `Zugewiesen: ${member.name}` : undefined

    vevents.push(
      renderVEvent({
        uid: uid(evt.id, familyId),
        summary,
        dtStart: formatDateTime(startDate, evt.startTime),
        dtEnd: formatDateTime(startDate, evt.endTime),
        rrule: buildRRule(evt.recurrence, evt.days, evt.endDate),
        description,
        categories: category?.name,
        color: member?.color,
      }),
    )
  }

  // Convert care slots to VEVENTs
  for (const slot of filteredSlots) {
    const child = children[slot.childId]
    const assignee =
      slot.assignedTo === 'both'
        ? 'Beide'
        : slot.assignedTo === 'external'
          ? slot.externalName ?? 'Extern'
          : members[slot.assignedTo]?.name ?? slot.assignedTo
    const childName = child?.name ?? 'Kind'
    const summary = `Betreuung ${childName}`
    const description = `Betreuer: ${assignee}`
    const startDate = nextMatchingDate(slot.days)

    vevents.push(
      renderVEvent({
        uid: uid(slot.id, familyId),
        summary,
        dtStart: formatDateTime(startDate, slot.startTime),
        dtEnd: formatDateTime(startDate, slot.endTime),
        rrule: buildRRule(slot.recurrence, slot.days),
        description,
      }),
    )
  }

  const calendarName =
    scope === 'member' && filterId
      ? `Family Planner - ${members[filterId]?.name ?? 'Mitglied'}`
      : scope === 'child' && filterId
        ? `Family Planner - ${children[filterId]?.name ?? 'Kind'}`
        : 'Family Planner'

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Family Planner//DE',
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...vevents,
    'END:VCALENDAR',
  ]

  return lines.join('\r\n')
}

/**
 * Trigger a browser download for the given .ics content.
 */
export function downloadICS(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
