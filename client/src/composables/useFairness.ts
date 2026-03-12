import { ref, computed } from 'vue'
import { useEvents } from './useEvents'
import { useChildren } from './useChildren'
import { useFamily } from './useFamily'
import { useCategories } from './useCategories'
import {
  calculateWeeklyMetrics,
  calculateFairness,
  getWeekDays,
  getISOWeekNumber,
} from '@/lib/fairnessCalc'
import type { FairnessResult } from '@/lib/fairnessCalc'

export function useFairness() {
  const { events, eventList } = useEvents()
  const { careSlots } = useChildren()
  const { members } = useFamily()
  const { categories } = useCategories()

  const weekOffset = ref(0)

  const selectedWeekDays = computed(() => getWeekDays(weekOffset.value))

  const selectedWeekNumber = computed(() => {
    const days = selectedWeekDays.value
    if (days.length === 0) return 0
    return getISOWeekNumber(days[0])
  })

  const selectedWeekLabel = computed(() => {
    const days = selectedWeekDays.value
    if (days.length === 0) return ''
    const monday = days[0]
    const sunday = days[6]
    const formatDay = (d: Date) =>
      `${d.getDate()}.${d.getMonth() + 1 < 10 ? '' : ''}${String(d.getMonth() + 1).padStart(2, '0')}.`
    // Simplified: just show "KW X (dd.mm. – dd.mm.)"
    // but actually format properly
    const monStr = `${monday.getDate()}.`
    const sunStr = `${sunday.getDate()}. ${sunday.toLocaleString('de-DE', { month: 'long' })}`
    return `KW ${selectedWeekNumber.value} (${monStr}\u2013${sunStr})`
  })

  function computeMetrics(weekDays: Date[]): FairnessResult {
    const memberList = Object.values(members.value)
    if (memberList.length === 0) {
      return calculateFairness([])
    }

    const allEvents = eventList.value
    const allCareSlots = Object.values(careSlots.value)
    const allCategories = categories.value

    const metricsArray = memberList.map((member) =>
      calculateWeeklyMetrics(
        allEvents,
        allCareSlots,
        member.id,
        member.name,
        allCategories,
        weekDays,
      ),
    )

    return calculateFairness(metricsArray)
  }

  const currentWeekMetrics = computed<FairnessResult>(() => {
    const currentWeekDays = getWeekDays(0)
    return computeMetrics(currentWeekDays)
  })

  const selectedWeekMetrics = computed<FairnessResult>(() => {
    return computeMetrics(selectedWeekDays.value)
  })

  function navigateWeek(delta: number): void {
    weekOffset.value += delta
  }

  return {
    weekOffset,
    selectedWeekDays,
    selectedWeekNumber,
    selectedWeekLabel,
    currentWeekMetrics,
    selectedWeekMetrics,
    navigateWeek,
  }
}
