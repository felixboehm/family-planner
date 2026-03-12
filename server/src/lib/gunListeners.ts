import type { IGunInstance } from 'gun'
import { notifyMember, notifyFamily } from './pushService.js'

/**
 * Set up GunDB listeners that trigger push notifications on data changes.
 *
 * Watches:
 * - families/*/requests – new swap requests (status='pending') notify the target member
 * - families/*/events   – event changes notify all family members
 */
export function setupGunListeners(gun: IGunInstance<any>): void {
  console.log('[GunListeners] Setting up push-notification listeners')

  // -------------------------------------------------------------------------
  // Watch swap requests across all families
  // -------------------------------------------------------------------------
  gun
    .get('families')
    .map()
    .get('requests')
    .map()
    .on((data: any, requestId: string) => {
      if (!data || typeof data !== 'object') return
      if (data.status !== 'pending') return

      // We need the familyId – extract from the GunDB soul/path
      const familyId = extractFamilyId(data)
      if (!familyId) return

      const toMemberId: string | undefined = data.toMemberId
      if (!toMemberId) return

      notifyMember(familyId, toMemberId, {
        title: 'Neue Tausch-Anfrage',
        body: data.message || 'Du hast eine neue Tausch-Anfrage erhalten.',
        url: '/plan',
      }).catch((err) => {
        console.error('[GunListeners] Error notifying member about request:', err)
      })
    })

  // -------------------------------------------------------------------------
  // Watch events across all families
  // -------------------------------------------------------------------------
  gun
    .get('families')
    .map()
    .get('events')
    .map()
    .on((data: any, eventId: string) => {
      if (!data || typeof data !== 'object') return

      const familyId = extractFamilyId(data)
      if (!familyId) return

      const memberId: string | undefined = data.memberId

      notifyFamily(
        familyId,
        {
          title: 'Plan-Aktualisierung',
          body: data.title
            ? `Termin "${data.title}" wurde aktualisiert.`
            : 'Der Familienplan wurde aktualisiert.',
          url: '/plan',
        },
        memberId, // exclude the member who made the change
      ).catch((err) => {
        console.error('[GunListeners] Error notifying family about event:', err)
      })
    })

  console.log('[GunListeners] Listeners active')
}

/**
 * Attempt to extract the familyId from a GunDB node's soul.
 * GunDB souls typically look like: "families/<familyId>/requests/<requestId>"
 */
function extractFamilyId(data: any): string | null {
  const soul: string | undefined = data?._?.['#']
  if (!soul) return null

  const match = soul.match(/^families\/([^/]+)\//)
  return match?.[1] ?? null
}
