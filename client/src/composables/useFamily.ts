import { ref, watch } from 'vue'
import gun from '@/lib/gun'
import type { Family, Member } from '@/types/family'
import { useAuth } from './useAuth'

const family = ref<Family | null>(null)
const members = ref<Record<string, Member>>({})
const familyId = ref<string | null>(null)

let subscribedFamilyId: string | null = null

function subscribeToFamily(id: string): void {
  if (subscribedFamilyId === id) return
  subscribedFamilyId = id

  // Subscribe to family data
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

  // Subscribe to members
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

export function useFamily() {
  const { user } = useAuth()

  // Load family ID from user's data when authenticated
  function loadUserFamily(): void {
    if (!user.value) return

    gun
      .user()
      .get('familyId')
      .on((data: any) => {
        if (data && typeof data === 'string') {
          familyId.value = data
          subscribeToFamily(data)
        }
      })
  }

  // Watch for auth changes to load family
  watch(
    user,
    (newUser) => {
      if (newUser) {
        loadUserFamily()
      } else {
        family.value = null
        members.value = {}
        familyId.value = null
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

    // Store family ID in user's space
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

          // Store family ID in user's space
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

    const memberId = crypto.randomUUID()
    const now = Date.now()

    gun.get('families').get(familyId.value).get('members').get(memberId).put({
      name,
      color,
      createdAt: now,
    })

    // Store member ID in user's space for quick lookup
    gun.user().get('memberId').put(memberId)

    return memberId
  }

  return {
    family,
    members,
    familyId,
    createFamily,
    joinFamily,
    addMember,
  }
}
