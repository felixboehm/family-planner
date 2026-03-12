import webPush from 'web-push'

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface PushPayload {
  title: string
  body: string
  url?: string
}

/** In-memory subscription store keyed by `${familyId}:${memberId}` */
const subscriptions = new Map<string, PushSubscriptionData[]>()

/**
 * Initialize VAPID credentials for web-push.
 * Reads VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_EMAIL from env.
 */
export function initVapid(): void {
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const email = process.env.VAPID_EMAIL

  if (!publicKey || !privateKey || !email) {
    console.warn(
      '[PushService] VAPID keys not configured – push notifications disabled. ' +
        'Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_EMAIL in .env',
    )
    return
  }

  webPush.setVapidDetails(`mailto:${email}`, publicKey, privateKey)
  console.log('[PushService] VAPID initialized')
}

/**
 * Send a push notification to a single subscription.
 * Automatically removes the subscription if the endpoint is no longer valid (410 Gone).
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload,
): Promise<boolean> {
  try {
    await webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload),
    )
    return true
  } catch (err: any) {
    // 410 Gone – subscription expired / unsubscribed
    if (err.statusCode === 410 || err.statusCode === 404) {
      removeSubscriptionByEndpoint(subscription.endpoint)
      console.log('[PushService] Removed expired subscription:', subscription.endpoint)
    } else {
      console.error('[PushService] Failed to send push:', err.message)
    }
    return false
  }
}

/**
 * Send a push notification to all subscriptions for a given family member.
 */
export async function notifyMember(
  familyId: string,
  memberId: string,
  payload: PushPayload,
): Promise<void> {
  const subs = getSubscriptions(familyId, memberId)
  await Promise.allSettled(subs.map((sub) => sendPushNotification(sub, payload)))
}

/**
 * Send a push notification to all members of a family.
 */
export async function notifyFamily(
  familyId: string,
  payload: PushPayload,
  excludeMemberId?: string,
): Promise<void> {
  const promises: Promise<boolean>[] = []

  for (const [key, subs] of subscriptions.entries()) {
    if (!key.startsWith(`${familyId}:`)) continue
    if (excludeMemberId && key === `${familyId}:${excludeMemberId}`) continue

    for (const sub of subs) {
      promises.push(sendPushNotification(sub, payload))
    }
  }

  await Promise.allSettled(promises)
}

// ---------------------------------------------------------------------------
// Subscription store helpers
// ---------------------------------------------------------------------------

export function addSubscription(
  familyId: string,
  memberId: string,
  subscription: PushSubscriptionData,
): void {
  const key = `${familyId}:${memberId}`
  const existing = subscriptions.get(key) ?? []

  // Avoid duplicates by endpoint
  if (existing.some((s) => s.endpoint === subscription.endpoint)) return

  existing.push(subscription)
  subscriptions.set(key, existing)
  console.log(`[PushService] Subscription added for ${key} (total: ${existing.length})`)
}

export function removeSubscription(
  familyId: string,
  memberId: string,
  endpoint: string,
): boolean {
  const key = `${familyId}:${memberId}`
  const existing = subscriptions.get(key)
  if (!existing) return false

  const filtered = existing.filter((s) => s.endpoint !== endpoint)
  if (filtered.length === 0) {
    subscriptions.delete(key)
  } else {
    subscriptions.set(key, filtered)
  }
  return filtered.length < existing.length
}

export function getSubscriptions(familyId: string, memberId: string): PushSubscriptionData[] {
  return subscriptions.get(`${familyId}:${memberId}`) ?? []
}

/**
 * Remove a subscription across all keys when the endpoint is no longer valid.
 */
function removeSubscriptionByEndpoint(endpoint: string): void {
  for (const [key, subs] of subscriptions.entries()) {
    const filtered = subs.filter((s) => s.endpoint !== endpoint)
    if (filtered.length === 0) {
      subscriptions.delete(key)
    } else if (filtered.length < subs.length) {
      subscriptions.set(key, filtered)
    }
  }
}
