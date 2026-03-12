import Gun from 'gun'
import 'gun/sea'

const SEA = Gun.SEA

export interface FamilyKeypair {
  pub: string
  priv: string
  epub: string
  epriv: string
}

/** All family write paths for SEA certificates */
export const FAMILY_WRITE_POLICIES = [
  { '*': 'members', '+': '*' },
  { '*': 'events', '+': '*' },
  { '*': 'children', '+': '*' },
  { '*': 'requests', '+': '*' },
  { '*': 'categories', '+': '*' },
  { '*': 'finance', '+': '*' },
  { '*': 'subscription', '+': '*' },
  { '*': 'certs', '+': '*' },
  { '*': 'serverFamily' },
]

export async function generateFamilyPair(): Promise<FamilyKeypair> {
  const pair = await SEA.pair()
  return pair as FamilyKeypair
}

export async function encryptForUser(data: any, userPair: any): Promise<string> {
  return await SEA.encrypt(data, userPair)
}

export async function decryptFromUser(data: string, userPair: any): Promise<any> {
  return await SEA.decrypt(data, userPair)
}

export async function encryptWithFamilyKey(data: any, familyPair: FamilyKeypair): Promise<string> {
  return await SEA.encrypt(data, familyPair)
}

export async function decryptWithFamilyKey(data: string, familyPair: FamilyKeypair): Promise<any> {
  return await SEA.decrypt(data, familyPair)
}

export async function createFamilyCertificate(
  userPub: string,
  familyPair: FamilyKeypair,
): Promise<string> {
  return await (SEA as any).certify(userPub, FAMILY_WRITE_POLICIES, familyPair)
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  const array = new Uint8Array(6)
  crypto.getRandomValues(array)
  for (let i = 0; i < 6; i++) {
    code += chars[array[i] % chars.length]
  }
  return code
}

export async function encryptInvitePayload(
  familyPair: FamilyKeypair,
  code: string,
): Promise<string> {
  return await SEA.encrypt(JSON.stringify(familyPair), code)
}

export async function decryptInvitePayload(
  encrypted: string,
  code: string,
): Promise<FamilyKeypair> {
  const decrypted = await SEA.decrypt(encrypted, code)
  return JSON.parse(decrypted as string)
}
