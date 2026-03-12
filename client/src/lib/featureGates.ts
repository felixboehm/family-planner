export type Tier = 'free' | 'family' | 'premium'

export interface TierLimits {
  maxMembers: number
  maxChildren: number
  historyWeeks: number
  features: string[]
}

export const TIER_CONFIG: Record<Tier, TierLimits> = {
  free: {
    maxMembers: 2,
    maxChildren: 1,
    historyWeeks: 4,
    features: ['calendar', 'childcare', 'fairness', 'ical-export'],
  },
  family: {
    maxMembers: 6,
    maxChildren: 5,
    historyWeeks: -1,
    features: [
      'calendar',
      'childcare',
      'fairness',
      'ical-export',
      'ical-feed',
      'swap-requests',
      'comments',
    ],
  },
  premium: {
    maxMembers: 6,
    maxChildren: 5,
    historyWeeks: -1,
    features: [
      'calendar',
      'childcare',
      'fairness',
      'ical-export',
      'ical-feed',
      'swap-requests',
      'comments',
      'finance',
      'ai-assistant',
      'scenarios',
      'external-access',
    ],
  },
}

export function isFeatureEnabled(tier: Tier, feature: string): boolean {
  const config = TIER_CONFIG[tier]
  if (!config) return false
  return config.features.includes(feature)
}

export function getTierLimits(tier: Tier): TierLimits {
  return TIER_CONFIG[tier] ?? TIER_CONFIG.free
}

export function canAddMember(tier: Tier, currentCount: number): boolean {
  const limits = getTierLimits(tier)
  return currentCount < limits.maxMembers
}

export function canAddChild(tier: Tier, currentCount: number): boolean {
  const limits = getTierLimits(tier)
  return currentCount < limits.maxChildren
}
