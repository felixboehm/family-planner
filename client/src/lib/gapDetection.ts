export interface CareBlock {
  childId: string
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
  assignedTo: string
}

export interface CareGap {
  childId: string
  childName: string
  day: number // 0-6
  startTime: string
  endTime: string
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

/**
 * Find time periods within active hours that have no care slot assigned.
 * Sorts care blocks by start time, then scans for gaps between them
 * and at the boundaries of active hours.
 */
export function findCareGaps(
  careBlocks: CareBlock[],
  activeStart: string, // "07:00"
  activeEnd: string, // "20:00"
  childId: string,
  childName: string,
  day: number,
): CareGap[] {
  const activeStartMin = timeToMinutes(activeStart)
  const activeEndMin = timeToMinutes(activeEnd)

  if (activeStartMin >= activeEndMin) return []

  // Filter blocks for this child and clamp to active hours
  const blocks = careBlocks
    .filter((b) => b.childId === childId)
    .map((b) => ({
      start: Math.max(timeToMinutes(b.startTime), activeStartMin),
      end: Math.min(timeToMinutes(b.endTime), activeEndMin),
    }))
    .filter((b) => b.start < b.end)
    .sort((a, b) => a.start - b.start)

  const gaps: CareGap[] = []
  let cursor = activeStartMin

  for (const block of blocks) {
    if (block.start > cursor) {
      gaps.push({
        childId,
        childName,
        day,
        startTime: minutesToTime(cursor),
        endTime: minutesToTime(block.start),
      })
    }
    cursor = Math.max(cursor, block.end)
  }

  // Gap after last block until active end
  if (cursor < activeEndMin) {
    gaps.push({
      childId,
      childName,
      day,
      startTime: minutesToTime(cursor),
      endTime: minutesToTime(activeEndMin),
    })
  }

  return gaps
}
