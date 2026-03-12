import { ref, computed, watch } from 'vue'
import gun from '@/lib/gun'
import { useFamily } from './useFamily'
import {
  type Tier,
  type TierLimits,
  getTierLimits,
  isFeatureEnabled as checkFeature,
  canAddMember as checkCanAddMember,
  canAddChild as checkCanAddChild,
} from '@/lib/featureGates'

const tier = ref<Tier>('free')

let subscribedFamilyPub: string | null = null

function subscribeToTier(fPub: string): void {
  if (subscribedFamilyPub === fPub) return
  subscribedFamilyPub = fPub

  gun
    .user(fPub)
    .get('subscription')
    .get('tier')
    .on((data: any) => {
      if (data && typeof data === 'string' && ['free', 'family', 'premium'].includes(data)) {
        tier.value = data as Tier
      } else {
        tier.value = 'free'
      }
    })
}

export function useTier() {
  const { familyPub, familyCert, members } = useFamily()

  // Watch familyPub and subscribe to tier changes
  watch(
    familyPub,
    (pub) => {
      if (pub) {
        subscribeToTier(pub)
      } else {
        tier.value = 'free'
        subscribedFamilyPub = null
      }
    },
    { immediate: true },
  )

  const limits = computed<TierLimits>(() => getTierLimits(tier.value))

  function isFeatureEnabled(feature: string): boolean {
    return checkFeature(tier.value, feature)
  }

  const memberCount = computed(() => Object.keys(members.value).length)

  const canAddMember = computed(() => checkCanAddMember(tier.value, memberCount.value))

  const canAddChild = computed(() => checkCanAddChild(tier.value, 0)) // child count tracked separately if needed

  async function setTier(newTier: Tier): Promise<void> {
    if (!familyPub.value || !familyCert.value) return

    const cert = familyCert.value

    gun
      .user(familyPub.value)
      .get('subscription')
      .get('tier')
      .put(newTier as any, null, { opt: { cert } } as any)
    tier.value = newTier
  }

  return {
    tier,
    limits,
    isFeatureEnabled,
    canAddMember,
    canAddChild,
    setTier,
  }
}
