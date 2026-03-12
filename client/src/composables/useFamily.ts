import { ref, watch } from 'vue'
import gun from '@/lib/gun'
import type { Family, Member } from '@/types/family'
import { useAuth } from './useAuth'

const family = ref<Family | null>(null)
const members = ref<Record<string, Member>>({})
const familyId = ref<string | null>(null)
const currentMemberId = ref<string | null>(null)

let subscribedFamilyId: string | null = null

function subscribeToFamily(id: string): void {
  if (subscribedFamilyId === id) return
  subscribedFamilyId = id

  gun
    .get('families')
    .get(id)
    .on((data: any) => {
      if (data && typeof data === 'object') {
        family.value = {
          id,
          name: data.name ?? '',
          createdAt: data.createdAt ?? 0,
        }
      }
    })

  gun
    .get('families')
    .get(id)
    .get('members')
    .map()
    .on((data: any, key: string) => {
      if (data === null || data === undefined) {
        const updated = { ...members.value }
        delete updated[key]
        members.value = updated
        return
      }
      if (typeof data === 'object') {
        members.value = {
          ...members.value,
          [key]: {
            id: key,
            name: data.name ?? '',
            color: data.color ?? '#3b82f6',
            createdAt: data.createdAt ?? 0,
          },
        }
      }
    })
}

function loadFromUserSpace(): void {
  // Read familyId from gun user space
  gun.user().get('familyId').once((data: any) => {
    if (data && typeof data === 'string') {
      familyId.value = data
      subscribeToFamily(data)
    }
  })

  // Read memberId from gun user space
  gun.user().get('memberId').once((data: any) => {
    if (data && typeof data === 'string') {
      currentMemberId.value = data
    }
  })
}

export function useFamily() {
  const { user } = useAuth()

  watch(
    user,
    (newUser) => {
      if (newUser) {
        loadFromUserSpace()
      } else {
        family.value = null
        members.value = {}
        familyId.value = null
        currentMemberId.value = null
        subscribedFamilyId = null
      }
    },
    { immediate: true },
  )

  async function createFamily(name: string): Promise<string> {
    const id = crypto.randomUUID()
    const now = Date.now()

    gun.get('families').get(id).put({
      name,
      createdAt: now,
    })

    gun.user().get('familyId').put(id)

    familyId.value = id
    family.value = { id, name, createdAt: now }
    subscribeToFamily(id)

    return id
  }

  async function joinFamily(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      gun
        .get('families')
        .get(id)
        .once((data: any) => {
          if (!data || !data.name) {
            reject(new Error('Familie nicht gefunden'))
            return
          }

          gun.user().get('familyId').put(id)

          familyId.value = id
          family.value = {
            id,
            name: data.name,
            createdAt: data.createdAt ?? 0,
          }
          subscribeToFamily(id)
          resolve()
        })
    })
  }

  async function addMember(name: string, color: string): Promise<string> {
    if (!familyId.value) {
      throw new Error('Keine Familie ausgewaehlt')
    }

    // Check if user already has a member profile
    const existingMemberId = await new Promise<string | null>((resolve) => {
      gun.user().get('memberId').once((data: any) => {
        resolve(data && typeof data === 'string' ? data : null)
      })
    })

    if (existingMemberId) {
      gun.get('families').get(familyId.value).get('members').get(existingMemberId).put({
        name,
        color,
        createdAt: Date.now(),
      })
      currentMemberId.value = existingMemberId
      return existingMemberId
    }

    const memberId = crypto.randomUUID()
    const now = Date.now()

    gun.get('families').get(familyId.value).get('members').get(memberId).put({
      name,
      color,
      createdAt: now,
    })

    gun.user().get('memberId').put(memberId)
    currentMemberId.value = memberId

    return memberId
  }

  return {
    family,
    members,
    familyId,
    currentMemberId,
    createFamily,
    joinFamily,
    addMember,
  }
}
