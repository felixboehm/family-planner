import { Router, Request, Response } from 'express'
import { createAssistantResponse } from '../lib/claudeClient.js'

// Simple in-memory rate limiter: 20 requests per hour per IP
interface RateLimitEntry {
  timestamps: number[]
}

const rateLimitMap = new Map<string, RateLimitEntry>()
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX = 20

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  let entry = rateLimitMap.get(ip)

  if (!entry) {
    entry = { timestamps: [] }
    rateLimitMap.set(ip, entry)
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)

  if (entry.timestamps.length >= RATE_LIMIT_MAX) {
    return false
  }

  entry.timestamps.push(now)
  return true
}

// Periodically clean up old entries (every 10 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimitMap.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
    if (entry.timestamps.length === 0) {
      rateLimitMap.delete(ip)
    }
  }
}, 10 * 60 * 1000)

export function createAssistRouter(): Router {
  const router = Router()

  router.post('/assist', async (req: Request, res: Response) => {
    try {
      // Rate limiting
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown'
      if (!checkRateLimit(clientIp)) {
        res.status(429).json({
          error: 'Zu viele Anfragen. Bitte warte eine Weile und versuche es erneut.',
        })
        return
      }

      // Validate request body
      const { context, message } = req.body

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        res.status(400).json({ error: 'Nachricht darf nicht leer sein.' })
        return
      }

      if (!context || typeof context !== 'string') {
        res.status(400).json({ error: 'Kontext fehlt.' })
        return
      }

      // Limit input sizes
      if (message.length > 2000) {
        res.status(400).json({ error: 'Nachricht ist zu lang (max. 2000 Zeichen).' })
        return
      }

      if (context.length > 10000) {
        res.status(400).json({ error: 'Kontext ist zu gross.' })
        return
      }

      const response = await createAssistantResponse(context, message.trim())

      res.json({ response })
    } catch (err: any) {
      console.error('Assist endpoint error:', err.message || err)

      if (err.message?.includes('ANTHROPIC_API_KEY')) {
        res.status(503).json({
          error: 'KI-Assistent ist nicht konfiguriert. Bitte ANTHROPIC_API_KEY setzen.',
        })
        return
      }

      res.status(500).json({
        error: 'Ein Fehler ist aufgetreten. Bitte versuche es spaeter erneut.',
      })
    }
  })

  return router
}
