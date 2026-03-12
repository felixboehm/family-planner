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
   * GET /ical/:familyId/:scope
   *
   * Query params:
   *   - token: required auth token (familyId used as simple token for now)
   *   - filterId: optional memberId or childId
   *
   * Returns text/calendar content.
   */
  router.get('/:familyId/:scope', async (req, res) => {
    try {
      const { familyId, scope } = req.params
      const { token, filterId } = req.query

      // Simple token validation: token must match familyId
      if (!token || token !== familyId) {
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
        familyId,
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
