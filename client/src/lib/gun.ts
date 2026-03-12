import Gun from 'gun'
import 'gun/sea'

const RELAY_URL = import.meta.env.VITE_GUN_RELAY_URL || 'ws://localhost:8765/gun'

const gun = Gun({
  peers: [RELAY_URL],
  axe: false,
})

export const user = gun.user()

export default gun
