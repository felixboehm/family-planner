import { ref, watch } from 'vue'
import Gun from 'gun'
import gun from '@/lib/gun'
import type { Family, Member } from '@/types/family'
import type { FamilyKeypair } from '@/lib/sea'
import {
  generateFamilyPair,
  encryptForUser,
  decryptFromUser,
  createFamilyCertificate,
} from '@/lib/sea'
import { useAuth } from './useAuth'

const family = ref<Family | null>(null)
const members = ref<Record<string, Member>>({})
const familyPub = ref<string | null>(null)
const familyPair = ref<FamilyKeypair | null>(null)
const familyCert = ref<string | null>(null)
const currentMemberId = ref<string | null>(null)

// Alias for backward compatibility – consumers still using familyId keep working
const familyId = familyPub

let subscribedFamilyPub: string | null = null

function subscribeToFamily(pub: string): void {
  if (subscribedFamilyPub === pub) return
  subscribedFamilyPub = pub

  gun.user(pub).on((data: any) => {
    if (data && typeof data === 'object') {
      family.value = {
        id: pub,
        name: data.name ?? '',
        createdAt: data.createdAt ?? 0,
      }
    }
  })

  gun
    .user(pub)
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
  const userPair = (gun.user() as any)._.sea

  // Read familyPub from gun user space
  gun.user().get('familyPub').once((data: any) => {
    if (data && typeof data === 'string') {
      familyPub.value = data
      subscribeToFamily(data)
    }
  })

  // Read and decrypt family keypair
  gun.user().get('family').once(async (data: any) => {
    if (data && typeof data === 'string' && userPair) {
      const decrypted = await decryptFromUser(data, userPair)
      if (decrypted) {
        familyPair.value = decrypted as FamilyKeypair
      }
    }
  })

  // Read family certificate
  gun.user().get('familyCert').once((data: any) => {
    if (data && typeof data === 'string') {
      familyCert.value = data
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
        familyPub.value = null
        familyPair.value = null
        familyCert.value = null
        currentMemberId.value = null
        subscribedFamilyPub = null
      }
    },
    { immediate: true },
  )

  async function createFamily(name: string): Promise<string> {
    const pair = await generateFamilyPair()
    const now = Date.now()
    const userPair = (gun.user() as any)._.sea
    const userPub = userPair.pub

    // Bootstrap the family user space with a temporary Gun instance
    const RELAY_URL = import.meta.env.VITE_GUN_RELAY_URL || 'ws://localhost:8765/gun'
    const tempGun = Gun({ peers: [RELAY_URL], axe: false })

    await new Promise<void>((resolve, reject) => {
      tempGun.user().auth(pair as any, (ack: any) => {
        if (ack.err) {
          reject(new Error(ack.err))
          return
        }
        tempGun.user().get('name').put(name)
        tempGun.user().get('createdAt').put(now as any)
        // Leave the family user after bootstrap
        setTimeout(() => {
          tempGun.user().leave()
          resolve()
        }, 500)
      })
    })

    // Store encrypted family keypair in own user space
    const encrypted = await encryptForUser(pair, userPair)
    gun.user().get('family').put(encrypted)
    gun.user().get('familyPub').put(pair.pub)

    // Create write certificate for self
    const cert = await createFamilyCertificate(userPub, pair)
    gun.user().get('familyCert').put(cert)

    // Store cert in family space (needs temp auth since no cert exists yet)
    const tempGun2 = Gun({ peers: [RELAY_URL], axe: false })
    await new Promise<void>((resolve) => {
      tempGun2.user().auth(pair as any, (ack: any) => {
        if (ack.err) {
          console.error('Failed to auth as family for cert storage:', ack.err)
          resolve()
          return
        }
        tempGun2.user().get('certs').get(userPub).put(cert)
        setTimeout(() => {
          tempGun2.user().leave()
          resolve()
        }, 500)
      })
    })

    // Update local state
    familyPub.value = pair.pub
    familyPair.value = pair
    familyCert.value = cert
    family.value = { id: pair.pub, name, createdAt: now }
    subscribeToFamily(pair.pub)

    return pair.pub
  }

  async function addMember(name: string, color: string): Promise<string> {
    if (!familyPub.value || !familyCert.value) {
      throw new Error('Keine Familie ausgewaehlt')
    }

    // Check if user already has a member profile
    const existingMemberId = await new Promise<string | null>((resolve) => {
      gun.user().get('memberId').once((data: any) => {
        resolve(data && typeof data === 'string' ? data : null)
      })
    })

    const cert = familyCert.value

    if (existingMemberId) {
      gun
        .user(familyPub.value)
        .get('members')
        .get(existingMemberId)
        .put(
          { name, color, createdAt: Date.now() } as any,
          null,
          { opt: { cert } } as any,
        )
      currentMemberId.value = existingMemberId
      return existingMemberId
    }

    const memberId = crypto.randomUUID()
    const now = Date.now()

    gun
      .user(familyPub.value)
      .get('members')
      .get(memberId)
      .put(
        { name, color, createdAt: now } as any,
        null,
        { opt: { cert } } as any,
      )

    gun.user().get('memberId').put(memberId)
    currentMemberId.value = memberId

    return memberId
  }

  return {
    family,
    members,
    familyPub,
    familyPair,
    familyCert,
    familyId, // alias for familyPub – backward compatibility
    currentMemberId,
    createFamily,
    addMember,
  }
}
