import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import Gun from 'gun'
import { createIcalRouter } from './routes/ical'
import { initVapid } from './lib/pushService.js'
import { setupGunListeners } from './lib/gunListeners.js'
import { createPushRouter } from './routes/push.js'
import { createAssistRouter } from './routes/assist.js'

const app = express()
const port = Number(process.env.PORT) || 8765

app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Initialize VAPID for web-push
initVapid()

// Mount push notification routes
app.use('/push', createPushRouter())

// AI Assistant route
app.use(createAssistRouter())

const server = createServer(app)

// Attach GunDB relay to the HTTP server
const gun = Gun({
  web: server,
  file: 'data',
  peers: process.env.GUN_PEERS ? process.env.GUN_PEERS.split(',') : [],
})

// Mount iCal feed router
app.use('/ical', createIcalRouter(gun))

// Set up GunDB listeners for push notifications
setupGunListeners(gun)

server.listen(port, () => {
  console.log(`Family-Planner relay server running on port ${port}`)
  console.log(`Health check: http://localhost:${port}/health`)
  console.log(`GunDB relay: ws://localhost:${port}/gun`)
})

export { app, gun }
