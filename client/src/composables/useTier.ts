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

let subscribedFamilyId: string | null = null

function subscribeToTier(familyId: string): void {
  if (subscribedFamilyId === familyId) return
  subscribedFamilyId = familyId

  gun
    .get('families')
    .get(familyId)
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
  const { familyId, members } = useFamily()

  // Watch familyId and subscribe to tier changes
  watch(
    familyId,
    (id) => {
      if (id) {
        subscribeToTier(id)
      } else {
        tier.value = 'free'
        subscribedFamilyId = null
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
    if (!familyId.value) return
    gun
      .get('families')
      .get(familyId.value)
      .get('subscription')
      .get('tier')
      .put(newTier)
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
