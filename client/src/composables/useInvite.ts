import { ref } from 'vue'
import gun from '@/lib/gun'
import {
  generateInviteCode,
  encryptInvitePayload,
  decryptInvitePayload,
  encryptForUser,
  createFamilyCertificate,
} from '@/lib/sea'
import type { FamilyKeypair } from '@/lib/sea'
import { useFamily } from './useFamily'

const inviteCode = ref<string | null>(null)
const isGenerating = ref(false)
const isRedeeming = ref(false)
const error = ref<string | null>(null)

export function useInvite() {
  const { familyPair, familyPub } = useFamily()

  async function generateInvite(): Promise<string> {
    if (!familyPair.value || !familyPub.value) {
      throw new Error('Keine Familie vorhanden')
    }

    isGenerating.value = true
    error.value = null

    try {
      const code = generateInviteCode()
      const encrypted = await encryptInvitePayload(familyPair.value, code)
      const now = Date.now()

      gun.get('invites').get(code).put({
        payload: encrypted,
        familyPub: familyPub.value,
        createdAt: now,
        expiresAt: now + 24 * 60 * 60 * 1000,
      } as any)

      inviteCode.value = code
      return code
    } catch (e: any) {
      error.value = e.message || 'Einladung konnte nicht erstellt werden'
      throw e
    } finally {
      isGenerating.value = false
    }
  }

  async function redeemInvite(code: string): Promise<void> {
    isRedeeming.value = true
    error.value = null

    try {
      const invite = await new Promise<any>((resolve, reject) => {
        gun.get('invites').get(code.toUpperCase()).once((data: any) => {
          if (!data || !data.payload) {
            reject(new Error('Einladungscode ungueltig'))
            return
          }
          resolve(data)
        })
      })

      // Check expiry
      if (invite.expiresAt && Date.now() > invite.expiresAt) {
        throw new Error('Einladungscode abgelaufen')
      }

      // Decrypt family keypair
      const pair = await decryptInvitePayload(invite.payload, code.toUpperCase())
      if (!pair || !pair.pub) {
        throw new Error('Einladungscode konnte nicht entschluesselt werden')
      }

      const userPair = (gun.user() as any)._.sea
      const userPub = userPair.pub

      // Store encrypted family keypair in own user space
      const encrypted = await encryptForUser(pair, userPair)
      gun.user().get('family').put(encrypted)
      gun.user().get('familyPub').put(pair.pub)

      // Create own certificate (partner has full keypair)
      const cert = await createFamilyCertificate(userPub, pair)
      gun.user().get('familyCert').put(cert)

      // Store cert in family space using certificate-based write
      // Since we just created the cert, we can write to the certs path
      gun
        .user(pair.pub)
        .get('certs')
        .get(userPub)
        .put(cert as any, null, { opt: { cert } } as any)

      // Delete the invite
      gun.get('invites').get(code.toUpperCase()).put(null as any)
    } catch (e: any) {
      error.value = e.message || 'Beitritt fehlgeschlagen'
      throw e
    } finally {
      isRedeeming.value = false
    }
  }

  return {
    inviteCode,
    isGenerating,
    isRedeeming,
    error,
    generateInvite,
    redeemInvite,
  }
}
