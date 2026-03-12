// GunDB instance type

const DAYS_ICAL = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const

function formatDateTime(date: Date, time: string): string {
  const [h, m] = time.split(':').map(Number)
  const y = String(date.getFullYear())
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${mo}${d}T${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}00`
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function buildRRule(
  recurrence: 'daily' | 'weekly' | 'biweekly',
  days: number[],
  endDate?: string,
): string {
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
    parts.push(`UNTIL=${endDate.replace(/-/g, '')}T235959`)
  }
  return parts.join(';')
}

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

/** Read a GunDB map node into an array of objects with parsed data */
function readGunMap<T>(gun: any, path: string[]): Promise<T[]> {
  return new Promise((resolve) => {
    let node = gun
    for (const p of path) {
      node = node.get(p)
    }

    const items: T[] = []
    let resolved = false

    node.map().once((data: any, key: string) => {
      if (data && typeof data === 'object') {
        items.push({ ...data, id: key } as T)
      }
    })

    // GunDB doesn't have a "done" callback for map, so use a timeout
    setTimeout(() => {
      if (!resolved) {
        resolved = true
        resolve(items)
      }
    }, 1500)
  })
}

interface RawEvent {
  id: string
  memberId: string
  title: string
  categoryId: string
  type: string
  days: string | number[]
  startTime: string
  endTime: string
  recurrence: 'daily' | 'weekly' | 'biweekly'
  endDate?: string
  createdAt: number
}

interface RawMember {
  id: string
  name: string
  color: string
  createdAt: number
}

interface RawChild {
  id: string
  name: string
  birthDate: string
  createdAt: number
}

interface RawCareSlot {
  id: string
  childId: string
  assignedTo: string
  externalName?: string
  days: string | number[]
  startTime: string
  endTime: string
  recurrence: 'daily' | 'weekly' | 'biweekly'
  createdAt: number
}

interface RawCategory {
  id: string
  name: string
  emoji: string
  type: string
  weight: string
  visibility: string
  isDefault: boolean
  createdAt: number
}

function parseDays(days: string | number[]): number[] {
  if (Array.isArray(days)) return days
  if (typeof days === 'string') {
    try {
      return JSON.parse(days)
    } catch {
      return []
    }
  }
  return []
}

export type FeedScope = 'family' | 'member' | 'child'

/**
 * Generate an iCalendar feed by reading data from GunDB.
 */
export async function generateFeed(
  gun: any,
  familyId: string,
  scope: FeedScope,
  filterId?: string,
): Promise<string> {
  const familyNode = gun.get('families').get(familyId)

  // Read all data in parallel
  const [events, members, categories, children] = await Promise.all([
    readGunMap<RawEvent>(gun, ['families', familyId, 'events']),
    readGunMap<RawMember>(gun, ['families', familyId, 'members']),
    readGunMap<RawCategory>(gun, ['families', familyId, 'categories']),
    readGunMap<RawChild>(gun, ['families', familyId, 'children']),
  ])

  // Read care slots per child
  const careSlots: RawCareSlot[] = []
  for (const child of children) {
    const slots = await readGunMap<RawCareSlot>(gun, [
      'families',
      familyId,
      'children',
      child.id,
      'slots',
    ])
    for (const slot of slots) {
      careSlots.push({ ...slot, childId: slot.childId ?? child.id })
    }
  }

  // Build lookup maps
  const memberMap = new Map(members.map((m) => [m.id, m]))
  const childMap = new Map(children.map((c) => [c.id, c]))
  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  // Filter by scope
  let filteredEvents = events
  let filteredSlots = careSlots

  if (scope === 'member' && filterId) {
    filteredEvents = events.filter((e) => e.memberId === filterId)
    filteredSlots = careSlots.filter((s) => s.assignedTo === filterId || s.assignedTo === 'both')
  } else if (scope === 'child' && filterId) {
    filteredEvents = []
    filteredSlots = careSlots.filter((s) => s.childId === filterId)
  }

  const vevents: string[] = []
  const now = new Date()
  const dtstamp = formatDateTime(now, '00:00').replace(
    /T\d{6}/,
    'T' + now.toISOString().slice(11, 19).replace(/:/g, ''),
  )

  for (const evt of filteredEvents) {
    const days = parseDays(evt.days)
    const member = memberMap.get(evt.memberId)
    const category = categoryMap.get(evt.categoryId)
    const startDate = nextMatchingDate(days)
    const prefix = category ? `${category.emoji} ` : ''

    const lines = [
      'BEGIN:VEVENT',
      `UID:${evt.id}@family-planner-${familyId}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${formatDateTime(startDate, evt.startTime || '08:00')}`,
      `DTEND:${formatDateTime(startDate, evt.endTime || '09:00')}`,
      `SUMMARY:${escapeText(`${prefix}${evt.title || 'Termin'}`)}`,
    ]

    const rrule = buildRRule(evt.recurrence || 'weekly', days, evt.endDate)
    if (rrule) lines.push(`RRULE:${rrule}`)
    if (member) lines.push(`DESCRIPTION:${escapeText(`Zugewiesen: ${member.name}`)}`)
    if (category) lines.push(`CATEGORIES:${escapeText(category.name)}`)
    if (member?.color) lines.push(`X-APPLE-CALENDAR-COLOR:${member.color}`)

    lines.push('END:VEVENT')
    vevents.push(lines.join('\r\n'))
  }

  for (const slot of filteredSlots) {
    const days = parseDays(slot.days)
    const child = childMap.get(slot.childId)
    const assignee =
      slot.assignedTo === 'both'
        ? 'Beide'
        : slot.assignedTo === 'external'
          ? slot.externalName ?? 'Extern'
          : memberMap.get(slot.assignedTo)?.name ?? slot.assignedTo

    const startDate = nextMatchingDate(days)

    const lines = [
      'BEGIN:VEVENT',
      `UID:${slot.id}@family-planner-${familyId}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${formatDateTime(startDate, slot.startTime || '08:00')}`,
      `DTEND:${formatDateTime(startDate, slot.endTime || '09:00')}`,
      `SUMMARY:${escapeText(`Betreuung ${child?.name ?? 'Kind'}`)}`,
      `DESCRIPTION:${escapeText(`Betreuer: ${assignee}`)}`,
    ]

    const rrule = buildRRule(slot.recurrence || 'weekly', days)
    if (rrule) lines.push(`RRULE:${rrule}`)

    lines.push('END:VEVENT')
    vevents.push(lines.join('\r\n'))
  }

  // Determine calendar name
  let calName = 'Family Planner'
  if (scope === 'member' && filterId) {
    const m = memberMap.get(filterId)
    calName = `Family Planner - ${m?.name ?? 'Mitglied'}`
  } else if (scope === 'child' && filterId) {
    const c = childMap.get(filterId)
    calName = `Family Planner - ${c?.name ?? 'Kind'}`
  }

  const cal = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Family Planner//DE',
    `X-WR-CALNAME:${escapeText(calName)}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...vevents,
    'END:VCALENDAR',
  ]

  return cal.join('\r\n')
}
