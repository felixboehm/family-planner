import { ref, computed, watch } from 'vue'
import gun from '@/lib/gun'
import type { SwapRequest } from '@/types/family'
import { useFamily } from './useFamily'

const requests = ref<Record<string, SwapRequest>>({})
let subscribedFamilyId: string | null = null

function subscribeToRequests(fId: string): void {
  if (subscribedFamilyId === fId) return
  subscribedFamilyId = fId

  gun
    .get('families')
    .get(fId)
    .get('requests')
    .map()
    .on((data: any, key: string) => {
      if (data === null || data === undefined) {
        const updated = { ...requests.value }
        delete updated[key]
        requests.value = updated
        return
      }
      if (typeof data === 'object') {
        requests.value = {
          ...requests.value,
          [key]: {
            id: key,
            fromMemberId: data.fromMemberId ?? '',
            toMemberId: data.toMemberId ?? '',
            eventId: data.eventId || undefined,
            slotId: data.slotId || undefined,
            message: data.message ?? '',
            status: data.status ?? 'pending',
            createdAt: data.createdAt ?? 0,
          },
        }
      }
    })
}

export function useRequests() {
  const { familyId } = useFamily()

  watch(
    familyId,
    (newId) => {
      if (newId) {
        subscribeToRequests(newId)
      } else {
        requests.value = {}
        subscribedFamilyId = null
      }
    },
    { immediate: true },
  )

  const requestList = computed(() =>
    Object.values(requests.value).sort((a, b) => b.createdAt - a.createdAt),
  )

  const pendingRequests = computed(() =>
    requestList.value.filter((r) => r.status === 'pending'),
  )

  const pendingCount = computed(() => pendingRequests.value.length)

  function createRequest(data: Partial<SwapRequest>): string {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    const id = `req-${crypto.randomUUID()}`
    const now = Date.now()

    gun
      .get('families')
      .get(familyId.value)
      .get('requests')
      .get(id)
      .put({
        fromMemberId: data.fromMemberId ?? '',
        toMemberId: data.toMemberId ?? '',
        eventId: data.eventId ?? '',
        slotId: data.slotId ?? '',
        message: data.message ?? '',
        status: 'pending',
        createdAt: now,
      } as any)

    return id
  }

  function acceptRequest(id: string): void {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    gun
      .get('families')
      .get(familyId.value)
      .get('requests')
      .get(id)
      .put({ status: 'accepted' } as any)
  }

  function rejectRequest(id: string): void {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    gun
      .get('families')
      .get(familyId.value)
      .get('requests')
      .get(id)
      .put({ status: 'rejected' } as any)
  }

  return {
    requests,
    requestList,
    pendingRequests,
    pendingCount,
    createRequest,
    acceptRequest,
    rejectRequest,
  }
}
