<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Tier } from '@/lib/featureGates'

const props = defineProps<{
  feature: string
  requiredTier: Tier
}>()

const router = useRouter()

const featureLabels: Record<string, string> = {
  'ical-feed': 'iCal-Feed',
  'swap-requests': 'Tauschanfragen',
  comments: 'Kommentare',
  finance: 'Finanzen',
  'ai-assistant': 'KI-Assistent',
  scenarios: 'Szenarien',
  'external-access': 'Externer Zugriff',
}

const tierLabels: Record<Tier, string> = {
  free: 'Free',
  family: 'Family',
  premium: 'Premium',
}

const tierPricing: Record<Tier, string> = {
  free: 'Kostenlos',
  family: '4,99\u20AC/Mo',
  premium: '9,99\u20AC/Mo',
}

const featureLabel = computed(() => featureLabels[props.feature] ?? props.feature)
const tierLabel = computed(() => tierLabels[props.requiredTier])
const pricing = computed(() => tierPricing[props.requiredTier])

function navigateToSubscription(): void {
  router.push('/subscription')
}
</script>

<template>
  <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 text-center">
    <div class="text-4xl mb-3">&#x1F512;</div>
    <h3 class="text-lg font-semibold text-gray-800 mb-2">
      {{ featureLabel }} ist nicht verfuegbar
    </h3>
    <p class="text-gray-600 mb-4">
      Diese Funktion erfordert den
      <span class="font-semibold text-blue-600">{{ tierLabel }}</span>-Plan
      ({{ pricing }}).
    </p>
    <button
      @click="navigateToSubscription"
      class="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
      Jetzt upgraden
    </button>
  </div>
</template>
