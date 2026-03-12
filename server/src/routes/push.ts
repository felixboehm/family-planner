import { Router } from 'express'
import {
  addSubscription,
  removeSubscription,
  type PushSubscriptionData,
} from '../lib/pushService.js'

export interface PushSubscribeBody {
  familyPub: string
  memberId: string
  subscription: PushSubscriptionData
}

export interface PushUnsubscribeBody {
  familyPub: string
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
    const { familyPub, memberId, subscription } = req.body as PushSubscribeBody

    if (!familyPub || !memberId || !subscription?.endpoint || !subscription?.keys) {
      res.status(400).json({ error: 'Missing required fields: familyPub, memberId, subscription' })
      return
    }

    addSubscription(familyPub, memberId, subscription)
    res.json({ ok: true })
  })

  /**
   * DELETE /push/unsubscribe
   * Remove a push subscription for a family member.
   */
  router.delete('/unsubscribe', (req, res) => {
    const { familyPub, memberId, endpoint } = req.body as PushUnsubscribeBody

    if (!familyPub || !memberId || !endpoint) {
      res.status(400).json({ error: 'Missing required fields: familyPub, memberId, endpoint' })
      return
    }

    const removed = removeSubscription(familyPub, memberId, endpoint)
    res.json({ ok: true, removed })
  })

  return router
}
