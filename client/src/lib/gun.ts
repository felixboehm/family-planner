import Gun from 'gun'

const RELAY_URL = import.meta.env.VITE_GUN_RELAY_URL || 'ws://localhost:8765/gun'

const gun = Gun({
  peers: [RELAY_URL],
})

export default gun
