import { notifyMember, notifyFamily } from './pushService.js'
import { getServerPub } from './serverIdentity.js'

/**
 * Set up GunDB listeners that trigger push notifications on data changes.
 *
 * With SEA user spaces, we can no longer watch gun.get('families').map() globally.
 * Instead, the server watches a registration path where clients register families
 * for the server: gun.get('server-families').get(serverPub).map()
 *
 * For each registered familyPub, we set up per-family watchers on
 * gun.user(familyPub).get('requests') and gun.user(familyPub).get('events').
 */
export function setupGunListeners(gun: any): void {
  console.log('[GunListeners] Setting up push-notification listeners')

  const { pub: serverPub } = getServerPub()
  const watchedFamilies = new Set<string>()

  // Watch for family registrations directed at this server
  gun
    .get('server-families')
    .get(serverPub)
    .map()
    .on((data: any, familyPub: string) => {
      if (!data || !familyPub || watchedFamilies.has(familyPub)) return

      watchedFamilies.add(familyPub)
      console.log(`[GunListeners] Watching family: ${familyPub.substring(0, 20)}...`)

      setupFamilyListeners(gun, familyPub)
    })

  console.log('[GunListeners] Listeners active, watching for family registrations')
}

function setupFamilyListeners(gun: any, familyPub: string): void {
  // Watch swap requests for this family
  gun
    .user(familyPub)
    .get('requests')
    .map()
    .on((data: any, _requestId: string) => {
      if (!data || typeof data !== 'object') return
      if (data.status !== 'pending') return

      const toMemberId: string | undefined = data.toMemberId
      if (!toMemberId) return

      notifyMember(familyPub, toMemberId, {
        title: 'Neue Tausch-Anfrage',
        body: data.message || 'Du hast eine neue Tausch-Anfrage erhalten.',
        url: '/plan',
      }).catch((err) => {
        console.error('[GunListeners] Error notifying member about request:', err)
      })
    })

  // Watch events for this family
  gun
    .user(familyPub)
    .get('events')
    .map()
    .on((data: any, _eventId: string) => {
      if (!data || typeof data !== 'object') return

      const memberId: string | undefined = data.memberId

      notifyFamily(
        familyPub,
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
}
