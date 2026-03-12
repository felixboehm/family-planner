export interface TimeSlot {
  id: string
  memberId: string
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
  type: 'need' | 'wish'
  title: string
}

export interface Conflict {
  slotA: TimeSlot
  slotB: TimeSlot
  severity: 'warning' | 'error' // error if need vs need, warning otherwise
}

/**
 * Parse "HH:mm" to total minutes since midnight.
 */
function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * Check if two time ranges overlap.
 * Ranges are half-open: [start, end).
 */
export function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean {
  const s1 = parseTime(start1)
  const e1 = parseTime(end1)
  const s2 = parseTime(start2)
  const e2 = parseTime(end2)

  return s1 < e2 && s2 < e1
}

/**
 * Find all conflicts among the given time slots for a single day.
 * Only slots belonging to the same member are checked for conflicts.
 */
export function findConflicts(slots: TimeSlot[]): Conflict[] {
  const conflicts: Conflict[] = []

  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i]
      const b = slots[j]

      // Only detect conflicts for the same member
      if (a.memberId !== b.memberId) continue

      if (timesOverlap(a.startTime, a.endTime, b.startTime, b.endTime)) {
        const severity: 'warning' | 'error' =
          a.type === 'need' && b.type === 'need' ? 'error' : 'warning'

        conflicts.push({ slotA: a, slotB: b, severity })
      }
    }
  }

  return conflicts
}
