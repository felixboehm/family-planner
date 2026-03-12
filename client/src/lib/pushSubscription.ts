const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8765'
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

/** Check if the browser supports push notifications */
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

/** Check whether we currently have an active push subscription */
export async function isPushSubscribed(): Promise<boolean> {
  if (!isPushSupported()) return false

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  return subscription !== null
}

/**
 * Subscribe the current browser to push notifications.
 * Registers the service worker (if not already), requests permission,
 * creates a push subscription and sends it to the server.
 */
export async function subscribeToPush(familyId: string, memberId: string): Promise<boolean> {
  if (!isPushSupported()) {
    console.warn('[Push] Push notifications are not supported in this browser')
    return false
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('[Push] VAPID public key not configured (VITE_VAPID_PUBLIC_KEY)')
    return false
  }

  // Request notification permission
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    console.warn('[Push] Notification permission denied')
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready

    // Check for existing subscription first
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
    }

    const subscriptionJSON = subscription.toJSON()

    // Send subscription to server
    const response = await fetch(`${API_BASE}/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        familyId,
        memberId,
        subscription: {
          endpoint: subscriptionJSON.endpoint,
          keys: {
            p256dh: subscriptionJSON.keys?.p256dh,
            auth: subscriptionJSON.keys?.auth,
          },
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`)
    }

    console.log('[Push] Successfully subscribed')
    return true
  } catch (err) {
    console.error('[Push] Failed to subscribe:', err)
    return false
  }
}

/**
 * Unsubscribe from push notifications.
 * Removes the subscription from the browser and notifies the server.
 */
export async function unsubscribeFromPush(familyId: string, memberId: string): Promise<boolean> {
  if (!isPushSupported()) return false

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (!subscription) return true

    // Notify server first
    await fetch(`${API_BASE}/push/unsubscribe`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        familyId,
        memberId,
        endpoint: subscription.endpoint,
      }),
    })

    // Unsubscribe in browser
    await subscription.unsubscribe()

    console.log('[Push] Successfully unsubscribed')
    return true
  } catch (err) {
    console.error('[Push] Failed to unsubscribe:', err)
    return false
  }
}

/**
 * Convert a base64-encoded VAPID public key to a Uint8Array
 * (required by PushManager.subscribe).
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
