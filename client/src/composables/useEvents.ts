import { ref, computed, watch } from 'vue'
import gun from '@/lib/gun'
import type { FamilyEvent } from '@/types/family'
import { useFamily } from './useFamily'

const events = ref<Record<string, FamilyEvent>>({})
let subscribedFamilyPub: string | null = null

function subscribeToEvents(fPub: string): void {
  if (subscribedFamilyPub === fPub) return
  subscribedFamilyPub = fPub

  gun
    .user(fPub)
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
  const { familyPub, familyCert } = useFamily()

  watch(
    familyPub,
    (newPub) => {
      if (newPub) {
        subscribeToEvents(newPub)
      } else {
        events.value = {}
        subscribedFamilyPub = null
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
    if (!familyPub.value || !familyCert.value) throw new Error('Keine Familie ausgewaehlt')

    const id = `evt-${crypto.randomUUID()}`
    const now = Date.now()
    const cert = familyCert.value

    gun
      .user(familyPub.value)
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
      } as any, null, { opt: { cert } } as any)

    return id
  }

  function updateEvent(id: string, data: Partial<Omit<FamilyEvent, 'id'>>): void {
    if (!familyPub.value || !familyCert.value) throw new Error('Keine Familie ausgewaehlt')

    const putData: any = { ...data }
    if (data.days) {
      putData.days = JSON.stringify(data.days)
    }
    if (data.endDate === undefined) {
      putData.endDate = ''
    }

    const cert = familyCert.value

    gun
      .user(familyPub.value)
      .get('events')
      .get(id)
      .put(putData, null, { opt: { cert } } as any)
  }

  function removeEvent(id: string): void {
    if (!familyPub.value || !familyCert.value) throw new Error('Keine Familie ausgewaehlt')

    const cert = familyCert.value

    gun
      .user(familyPub.value)
      .get('events')
      .get(id)
      .put(null as any, null, { opt: { cert } } as any)
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
