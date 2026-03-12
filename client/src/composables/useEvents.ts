import { ref, computed, watch } from 'vue'
import gun from '@/lib/gun'
import type { FamilyEvent } from '@/types/family'
import { useFamily } from './useFamily'

const events = ref<Record<string, FamilyEvent>>({})
let subscribedFamilyId: string | null = null

function subscribeToEvents(fId: string): void {
  if (subscribedFamilyId === fId) return
  subscribedFamilyId = fId

  gun
    .get('families')
    .get(fId)
    .get('events')
    .map()
    .on((data: any, key: string) => {
      if (data === null || data === undefined) {
        const updated = { ...events.value }
        delete updated[key]
        events.value = updated
        return
      }
      if (typeof data === 'object') {
        // Parse days - GunDB may flatten arrays, so handle both string and array
        let days: number[] = []
        if (typeof data.days === 'string') {
          try {
            days = JSON.parse(data.days)
          } catch {
            days = []
          }
        } else if (Array.isArray(data.days)) {
          days = data.days
        }

        events.value = {
          ...events.value,
          [key]: {
            id: key,
            memberId: data.memberId ?? '',
            title: data.title ?? '',
            categoryId: data.categoryId ?? '',
            type: data.type ?? 'need',
            days,
            startTime: data.startTime ?? '08:00',
            endTime: data.endTime ?? '09:00',
            recurrence: data.recurrence ?? 'weekly',
            endDate: data.endDate || undefined,
            createdAt: data.createdAt ?? 0,
          },
        }
      }
    })
}

export function useEvents() {
  const { familyId } = useFamily()

  watch(
    familyId,
    (newId) => {
      if (newId) {
        subscribeToEvents(newId)
      } else {
        events.value = {}
        subscribedFamilyId = null
      }
    },
    { immediate: true },
  )

  const eventList = computed(() =>
    Object.values(events.value).sort((a, b) => {
      // Sort by start time, then by title
      if (a.startTime !== b.startTime) return a.startTime.localeCompare(b.startTime)
      return a.title.localeCompare(b.title)
    }),
  )

  function getEventsForMember(memberId: string) {
    return computed(() =>
      eventList.value.filter((e) => e.memberId === memberId),
    )
  }

  function getEventsForDay(dayOfWeek: number) {
    return computed(() =>
      eventList.value.filter((e) => e.days.includes(dayOfWeek)),
    )
  }

  function addEvent(data: Omit<FamilyEvent, 'id' | 'createdAt'>): string {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    const id = `evt-${crypto.randomUUID()}`
    const now = Date.now()

    gun
      .get('families')
      .get(familyId.value)
      .get('events')
      .get(id)
      .put({
        memberId: data.memberId,
        title: data.title,
        categoryId: data.categoryId,
        type: data.type,
        days: JSON.stringify(data.days),
        startTime: data.startTime,
        endTime: data.endTime,
        recurrence: data.recurrence,
        endDate: data.endDate ?? '',
        createdAt: now,
      } as any)

    return id
  }

  function updateEvent(id: string, data: Partial<Omit<FamilyEvent, 'id'>>): void {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    const putData: any = { ...data }
    if (data.days) {
      putData.days = JSON.stringify(data.days)
    }
    if (data.endDate === undefined) {
      putData.endDate = ''
    }

    gun
      .get('families')
      .get(familyId.value)
      .get('events')
      .get(id)
      .put(putData)
  }

  function removeEvent(id: string): void {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    gun
      .get('families')
      .get(familyId.value)
      .get('events')
      .get(id)
      .put(null as any)
  }

  return {
    events,
    eventList,
    getEventsForMember,
    getEventsForDay,
    addEvent,
    updateEvent,
    removeEvent,
  }
}
