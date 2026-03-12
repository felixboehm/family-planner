import { Router } from 'express'
import {
  addSubscription,
  removeSubscription,
  type PushSubscriptionData,
} from '../lib/pushService.js'

export interface PushSubscribeBody {
  familyId: string
  memberId: string
  subscription: PushSubscriptionData
}

export interface PushUnsubscribeBody {
  familyId: string
  memberId: string
  endpoint: string
}

/**
 * Factory function that creates and returns the push-notification router.
 */
export function createPushRouter(): Router {
  const router = Router()

  /**
   * POST /push/subscribe
   * Register a push subscription for a family member.
   */
  router.post('/subscribe', (req, res) => {
    const { familyId, memberId, subscription } = req.body as PushSubscribeBody

    if (!familyId || !memberId || !subscription?.endpoint || !subscription?.keys) {
      res.status(400).json({ error: 'Missing required fields: familyId, memberId, subscription' })
      return
    }

    addSubscription(familyId, memberId, subscription)
    res.json({ ok: true })
  })

  /**
   * DELETE /push/unsubscribe
   * Remove a push subscription for a family member.
   */
  router.delete('/unsubscribe', (req, res) => {
    const { familyId, memberId, endpoint } = req.body as PushUnsubscribeBody

    if (!familyId || !memberId || !endpoint) {
      res.status(400).json({ error: 'Missing required fields: familyId, memberId, endpoint' })
      return
    }

    const removed = removeSubscription(familyId, memberId, endpoint)
    res.json({ ok: true, removed })
  })

  return router
}
