import { Router } from 'express'
import { generateFeed, type FeedScope } from '../lib/icalGenerator'

/**
 * Create the iCal feed router.
 * @param gun - GunDB instance
 * @returns Express Router
 */
export function createIcalRouter(gun: any): Router {
  const router = Router()

  /**
   * GET /ical/:familyPub/:scope
   *
   * Query params:
   *   - token: required auth token
   *   - filterId: optional memberId or childId
   *
   * Returns text/calendar content.
   */
  router.get('/:familyPub/:scope', async (req, res) => {
    try {
      const { familyPub, scope } = req.params
      const { token, filterId } = req.query

      // Token validation: token must match familyPub
      if (!token || token !== familyPub) {
        res.status(401).json({ error: 'Unauthorized: invalid or missing token' })
        return
      }

      // Validate scope
      const validScopes: FeedScope[] = ['family', 'member', 'child']
      if (!validScopes.includes(scope as FeedScope)) {
        res.status(400).json({ error: `Invalid scope. Must be one of: ${validScopes.join(', ')}` })
        return
      }

      // Validate filterId requirement for member/child scopes
      if ((scope === 'member' || scope === 'child') && !filterId) {
        res.status(400).json({ error: `filterId query parameter required for scope "${scope}"` })
        return
      }

      const icsContent = await generateFeed(
        gun,
        familyPub,
        scope as FeedScope,
        filterId as string | undefined,
      )

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
      res.setHeader('Content-Disposition', `inline; filename="family-planner-${scope}.ics"`)
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.send(icsContent)
    } catch (err) {
      console.error('iCal feed error:', err)
      res.status(500).json({ error: 'Failed to generate calendar feed' })
    }
  })

  return router
}
