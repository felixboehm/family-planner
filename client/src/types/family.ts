export interface Member {
  id: string
  name: string
  color: string // hex color for calendar display
  createdAt: number
}

export interface FamilyEvent {
  id: string
  memberId: string
  title: string
  categoryId: string
  type: 'need' | 'wish'
  days: number[] // 0=Sun, 1=Mon, ... 6=Sat
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
  recurrence: 'daily' | 'weekly' | 'biweekly'
  endDate?: string // ISO date string
  createdAt: number
}

export interface Child {
  id: string
  name: string
  birthDate: string
  createdAt: number
}

export interface CareSlot {
  id: string
  childId: string
  assignedTo: string // memberId or 'both' or 'external'
  externalName?: string // e.g. "Kita", "Oma"
  days: number[]
  startTime: string
  endTime: string
  recurrence: 'daily' | 'weekly' | 'biweekly'
  createdAt: number
}

export interface SwapRequest {
  id: string
  fromMemberId: string
  toMemberId: string
  eventId?: string
  slotId?: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: number
}

export interface Category {
  id: string
  name: string
  emoji: string
  type: 'need' | 'wish'
  weight: string // 'family' | 'personal' | custom string
  visibility: 'personal' | 'family'
  isDefault: boolean
  createdAt: number
}

export interface Family {
  id: string
  name: string
  createdAt: number
}

export type { FamilyKeypair } from '@/lib/sea'
