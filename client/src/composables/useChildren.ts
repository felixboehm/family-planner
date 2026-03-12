import { ref, computed, watch } from 'vue'
import gun from '@/lib/gun'
import type { Child, CareSlot } from '@/types/family'
import { useFamily } from './useFamily'

const children = ref<Record<string, Child>>({})
const careSlots = ref<Record<string, CareSlot>>({})
let subscribedFamilyId: string | null = null

function subscribeToChildren(fId: string): void {
  if (subscribedFamilyId === fId) return
  subscribedFamilyId = fId

  // Subscribe to children
  gun
    .get('families')
    .get(fId)
    .get('children')
    .map()
    .on((data: any, key: string) => {
      if (data === null || data === undefined) {
        const updated = { ...children.value }
        delete updated[key]
        children.value = updated
        // Also remove associated care slots
        const updatedSlots = { ...careSlots.value }
        for (const [slotId, slot] of Object.entries(updatedSlots)) {
          if (slot.childId === key) {
            delete updatedSlots[slotId]
          }
        }
        careSlots.value = updatedSlots
        return
      }
      if (typeof data === 'object') {
        children.value = {
          ...children.value,
          [key]: {
            id: key,
            name: data.name ?? '',
            birthDate: data.birthDate ?? '',
            createdAt: data.createdAt ?? 0,
          },
        }

        // Subscribe to this child's care slots
        gun
          .get('families')
          .get(fId)
          .get('children')
          .get(key)
          .get('slots')
          .map()
          .on((slotData: any, slotKey: string) => {
            if (slotData === null || slotData === undefined) {
              const updatedSlots = { ...careSlots.value }
              delete updatedSlots[slotKey]
              careSlots.value = updatedSlots
              return
            }
            if (typeof slotData === 'object') {
              let days: number[] = []
              if (typeof slotData.days === 'string') {
                try {
                  days = JSON.parse(slotData.days)
                } catch {
                  days = []
                }
              } else if (Array.isArray(slotData.days)) {
                days = slotData.days
              }

              careSlots.value = {
                ...careSlots.value,
                [slotKey]: {
                  id: slotKey,
                  childId: slotData.childId ?? key,
                  assignedTo: slotData.assignedTo ?? '',
                  externalName: slotData.externalName || undefined,
                  days,
                  startTime: slotData.startTime ?? '08:00',
                  endTime: slotData.endTime ?? '09:00',
                  recurrence: slotData.recurrence ?? 'weekly',
                  createdAt: slotData.createdAt ?? 0,
                },
              }
            }
          })
      }
    })
}

export function useChildren() {
  const { familyId } = useFamily()

  watch(
    familyId,
    (newId) => {
      if (newId) {
        subscribeToChildren(newId)
      } else {
        children.value = {}
        careSlots.value = {}
        subscribedFamilyId = null
      }
    },
    { immediate: true },
  )

  const childList = computed(() =>
    Object.values(children.value).sort((a, b) => a.name.localeCompare(b.name)),
  )

  function careSlotsForChild(childId: string) {
    return computed(() =>
      Object.values(careSlots.value)
        .filter((s) => s.childId === childId)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    )
  }

  function addChild(name: string, birthDate: string): string {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    const id = `child-${crypto.randomUUID()}`
    const now = Date.now()

    gun.get('families').get(familyId.value).get('children').get(id).put({
      name,
      birthDate,
      createdAt: now,
    })

    return id
  }

  function updateChild(id: string, data: Partial<Omit<Child, 'id'>>): void {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    gun.get('families').get(familyId.value).get('children').get(id).put(data as any)
  }

  function removeChild(id: string): void {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    // Remove associated care slots first
    const slots = Object.values(careSlots.value).filter((s) => s.childId === id)
    for (const slot of slots) {
      gun
        .get('families')
        .get(familyId.value!)
        .get('children')
        .get(id)
        .get('slots')
        .get(slot.id)
        .put(null as any)
    }

    // Remove the child
    gun.get('families').get(familyId.value).get('children').get(id).put(null as any)
  }

  function addCareSlot(data: Omit<CareSlot, 'id' | 'createdAt'>): string {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    const id = `slot-${crypto.randomUUID()}`
    const now = Date.now()

    gun
      .get('families')
      .get(familyId.value)
      .get('children')
      .get(data.childId)
      .get('slots')
      .get(id)
      .put({
        childId: data.childId,
        assignedTo: data.assignedTo,
        externalName: data.externalName ?? '',
        days: JSON.stringify(data.days),
        startTime: data.startTime,
        endTime: data.endTime,
        recurrence: data.recurrence,
        createdAt: now,
      } as any)

    return id
  }

  function updateCareSlot(id: string, data: Partial<Omit<CareSlot, 'id'>>): void {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    const existing = careSlots.value[id]
    if (!existing) return

    const putData: any = { ...data }
    if (data.days) {
      putData.days = JSON.stringify(data.days)
    }
    if (data.externalName === undefined) {
      putData.externalName = ''
    }

    gun
      .get('families')
      .get(familyId.value)
      .get('children')
      .get(existing.childId)
      .get('slots')
      .get(id)
      .put(putData)
  }

  function removeCareSlot(id: string): void {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    const existing = careSlots.value[id]
    if (!existing) return

    gun
      .get('families')
      .get(familyId.value)
      .get('children')
      .get(existing.childId)
      .get('slots')
      .get(id)
      .put(null as any)
  }

  return {
    children,
    childList,
    careSlots,
    careSlotsForChild,
    addChild,
    updateChild,
    removeChild,
    addCareSlot,
    updateCareSlot,
    removeCareSlot,
  }
}
