import Gun from 'gun'
import 'gun/sea'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const SEA = Gun.SEA

interface ServerKeypair {
  pub: string
  priv: string
  epub: string
  epriv: string
}

let serverPair: ServerKeypair | null = null

const KEYPAIR_FILE = join(process.cwd(), 'data', 'server-keypair.json')

/**
 * Initialize the server's persistent SEA keypair.
 * Loads from disk if exists, otherwise generates a new one.
 */
export async function initServerIdentity(): Promise<void> {
  if (existsSync(KEYPAIR_FILE)) {
    const raw = readFileSync(KEYPAIR_FILE, 'utf-8')
    serverPair = JSON.parse(raw) as ServerKeypair
    console.log('[ServerIdentity] Loaded keypair from', KEYPAIR_FILE)
    console.log('[ServerIdentity] Server pub:', serverPair.pub.substring(0, 20) + '...')
    return
  }

  const pair = await SEA.pair()
  serverPair = pair as ServerKeypair

  writeFileSync(KEYPAIR_FILE, JSON.stringify(serverPair, null, 2))
  console.log('[ServerIdentity] Generated new keypair, saved to', KEYPAIR_FILE)
  console.log('[ServerIdentity] Server pub:', serverPair.pub.substring(0, 20) + '...')
}

export function getServerPub(): { pub: string; epub: string } {
  if (!serverPair) throw new Error('Server identity not initialized')
  return { pub: serverPair.pub, epub: serverPair.epub }
}

export function getServerPair(): ServerKeypair {
  if (!serverPair) throw new Error('Server identity not initialized')
  return serverPair
}

/**
 * Decrypt a family keypair that was encrypted for the server
 * using Diffie-Hellman (SEA.secret + SEA.encrypt).
 */
export async function decryptFamilyPair(
  encryptedPayload: string,
  familyEpub: string,
): Promise<ServerKeypair | null> {
  if (!serverPair) throw new Error('Server identity not initialized')

  const secret = await SEA.secret(familyEpub, serverPair as any)
  const decrypted = await SEA.decrypt(encryptedPayload, secret as any)
  if (!decrypted) return null

  return (typeof decrypted === 'string' ? JSON.parse(decrypted) : decrypted) as ServerKeypair
}
