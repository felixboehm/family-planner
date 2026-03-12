import type { FamilyEvent, CareSlot, Category } from '@/types/family'

export interface WeeklyMetrics {
  memberId: string
  memberName: string
  familyContribution: number // hours: work + childcare + household
  personalNeed: number // hours: sleep, recovery
  personalWish: number // hours: study, sport, hobby
  wishFulfillmentRate: number // 0-1: ratio of wish events that occurred vs planned
}

export interface FairnessResult {
  metrics: WeeklyMetrics[]
  contributionDelta: number // hours difference between members
  wishBalanceRatio: number // 0-1: how balanced wish time is
  overallScore: number // 0-100: composite fairness score
}

/**
 * Parse "HH:mm" time string to hours as a decimal number.
 */
function timeToHours(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h + m / 60
}

/**
 * Calculate the duration in hours between two "HH:mm" time strings.
 */
function durationHours(startTime: string, endTime: string): number {
  const diff = timeToHours(endTime) - timeToHours(startTime)
  return Math.max(0, diff)
}

/**
 * Check if an event is active on a given day of the week (0=Sun..6=Sat).
 */
function isEventActiveOnDay(event: { days: number[] }, dayOfWeek: number): boolean {
  return event.days.includes(dayOfWeek)
}

/**
 * Get the days of the week (as Date objects) for a given week offset.
 * Week starts on Monday. Offset 0 = current week, -1 = last week, etc.
 */
export function getWeekDays(weekOffset: number = 0): Date[] {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=Sun
  // Monday is day 1; shift so Monday = 0
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset + weekOffset * 7)
  monday.setHours(0, 0, 0, 0)

  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push(d)
  }
  return days
}

/**
 * Get ISO week number for a date.
 */
export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/**
 * Filter events that are active during a specific week.
 * Considers endDate to exclude expired events.
 */
function filterEventsForWeek(
  events: FamilyEvent[],
  weekDays: Date[],
): FamilyEvent[] {
  const weekStart = weekDays[0]
  const weekEnd = weekDays[6]

  return events.filter((event) => {
    // If event has an endDate, check it hasn't expired before the week starts
    if (event.endDate) {
      const end = new Date(event.endDate)
      if (end < weekStart) return false
    }

    // Check if event has any days that fall within this week
    return weekDays.some((day) => isEventActiveOnDay(event, day.getDay()))
  })
}

/**
 * Filter care slots that are active during a specific week.
 */
function filterCareSlotsForWeek(
  slots: CareSlot[],
  weekDays: Date[],
): CareSlot[] {
  return slots.filter((slot) =>
    weekDays.some((day) => isEventActiveOnDay(slot, day.getDay())),
  )
}

/**
 * Count how many days in a week an event/slot is active.
 */
function activeDaysInWeek(item: { days: number[] }, weekDays: Date[]): number {
  return weekDays.filter((day) => item.days.includes(day.getDay())).length
}

/**
 * Calculate hours from events for a given member, filtered by category weight and type.
 */
export function calculateHoursForCategory(
  events: FamilyEvent[],
  careSlots: CareSlot[],
  memberId: string,
  categoryWeight: string,
  categoryType: 'need' | 'wish',
  categories: Record<string, Category>,
  weekDays: Date[],
): number {
  let totalHours = 0

  // Filter events for this member
  const memberEvents = filterEventsForWeek(
    events.filter((e) => e.memberId === memberId),
    weekDays,
  )

  for (const event of memberEvents) {
    const category = categories[event.categoryId]
    if (!category) continue
    if (category.weight !== categoryWeight) continue
    if (category.type !== categoryType) continue

    const hours = durationHours(event.startTime, event.endTime)
    const daysActive = activeDaysInWeek(event, weekDays)
    totalHours += hours * daysActive
  }

  // If looking for family contribution, also include care slots assigned to this member
  if (categoryWeight === 'family' && categoryType === 'need') {
    const memberSlots = filterCareSlotsForWeek(
      careSlots.filter((s) => s.assignedTo === memberId),
      weekDays,
    )

    for (const slot of memberSlots) {
      const hours = durationHours(slot.startTime, slot.endTime)
      const daysActive = activeDaysInWeek(slot, weekDays)
      totalHours += hours * daysActive
    }
  }

  return Math.round(totalHours * 10) / 10
}

/**
 * Calculate weekly metrics for one member.
 */
export function calculateWeeklyMetrics(
  events: FamilyEvent[],
  careSlots: CareSlot[],
  memberId: string,
  memberName: string,
  categories: Record<string, Category>,
  weekDays: Date[],
): WeeklyMetrics {
  // Family contribution: family-weight events (needs) + care slots
  const familyContribution = calculateHoursForCategory(
    events,
    careSlots,
    memberId,
    'family',
    'need',
    categories,
    weekDays,
  )

  // Personal needs: personal-weight events of type 'need'
  const personalNeed = calculateHoursForCategory(
    events,
    careSlots,
    memberId,
    'personal',
    'need',
    categories,
    weekDays,
  )

  // Personal wishes: personal-weight events of type 'wish'
  const personalWish = calculateHoursForCategory(
    events,
    careSlots,
    memberId,
    'personal',
    'wish',
    categories,
    weekDays,
  )

  // Wish fulfillment rate: ratio of wish events that have active days in the week
  const memberEvents = events.filter((e) => e.memberId === memberId)
  const wishEvents = memberEvents.filter((e) => {
    const cat = categories[e.categoryId]
    return cat && cat.type === 'wish'
  })

  let wishFulfillmentRate = 1 // default: perfect if no wishes
  if (wishEvents.length > 0) {
    const activeWishes = wishEvents.filter((e) =>
      weekDays.some((day) => isEventActiveOnDay(e, day.getDay())),
    )
    wishFulfillmentRate = activeWishes.length / wishEvents.length
  }

  return {
    memberId,
    memberName,
    familyContribution,
    personalNeed,
    personalWish,
    wishFulfillmentRate: Math.round(wishFulfillmentRate * 100) / 100,
  }
}

/**
 * Calculate fairness across all members.
 * Overall score: 100 = perfectly balanced, penalized for contribution delta and wish imbalance.
 */
export function calculateFairness(metricsArray: WeeklyMetrics[]): FairnessResult {
  if (metricsArray.length === 0) {
    return {
      metrics: [],
      contributionDelta: 0,
      wishBalanceRatio: 1,
      overallScore: 100,
    }
  }

  if (metricsArray.length === 1) {
    return {
      metrics: metricsArray,
      contributionDelta: 0,
      wishBalanceRatio: 1,
      overallScore: 100,
    }
  }

  // Contribution delta: difference between max and min family contribution
  const contributions = metricsArray.map((m) => m.familyContribution)
  const maxContribution = Math.max(...contributions)
  const minContribution = Math.min(...contributions)
  const contributionDelta = Math.round((maxContribution - minContribution) * 10) / 10

  // Wish balance ratio: how balanced wish time is across members
  const wishTimes = metricsArray.map((m) => m.personalWish)
  const maxWish = Math.max(...wishTimes)
  const minWish = Math.min(...wishTimes)
  let wishBalanceRatio = 1
  if (maxWish > 0) {
    wishBalanceRatio = Math.round((minWish / maxWish) * 100) / 100
  }

  // Penalty for contribution delta: each hour of delta costs points
  // Max penalty 50 points, scaled so 10h delta = 50 points penalty
  const contributionDeltaPenalty = Math.min(50, (contributionDelta / 10) * 50)

  // Penalty for wish imbalance: max 50 points
  const wishImbalancePenalty = (1 - wishBalanceRatio) * 50

  const overallScore = Math.max(
    0,
    Math.min(100, Math.round(100 - contributionDeltaPenalty - wishImbalancePenalty)),
  )

  return {
    metrics: metricsArray,
    contributionDelta,
    wishBalanceRatio,
    overallScore,
  }
}
