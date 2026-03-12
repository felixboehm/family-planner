<script setup lang="ts">
import { computed } from 'vue'
import { useTier } from '@/composables/useTier'
import type { Tier } from '@/lib/featureGates'
import { TIER_CONFIG } from '@/lib/featureGates'

const { tier, setTier } = useTier()

interface TierCard {
  id: Tier
  name: string
  price: string
  priceNote: string
  highlight: boolean
  features: string[]
}

const tiers: TierCard[] = [
  {
    id: 'free',
    name: 'Free',
    price: '0\u20AC',
    priceNote: 'Fuer immer kostenlos',
    highlight: false,
    features: [
      'Bis zu 2 Mitglieder',
      '1 Kind',
      'Kalender',
      'Betreuungsplanung',
      'Fairness-Index',
      'iCal-Export',
      '4 Wochen Historie',
    ],
  },
  {
    id: 'family',
    name: 'Family',
    price: '4,99\u20AC',
    priceNote: 'pro Monat',
    highlight: true,
    features: [
      'Bis zu 6 Mitglieder',
      'Bis zu 5 Kinder',
      'Alles aus Free',
      'iCal-Feed',
      'Tauschanfragen',
      'Kommentare',
      'Unbegrenzte Historie',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '9,99\u20AC',
    priceNote: 'pro Monat',
    highlight: false,
    features: [
      'Alles aus Family',
      'Finanzen',
      'KI-Assistent',
      'Szenarien-Planung',
      'Externer Zugriff',
      'Prioritaets-Support',
    ],
  },
]

const allFeatures = [
  { key: 'calendar', label: 'Kalender' },
  { key: 'childcare', label: 'Betreuungsplanung' },
  { key: 'fairness', label: 'Fairness-Index' },
  { key: 'ical-export', label: 'iCal-Export' },
  { key: 'ical-feed', label: 'iCal-Feed' },
  { key: 'swap-requests', label: 'Tauschanfragen' },
  { key: 'comments', label: 'Kommentare' },
  { key: 'finance', label: 'Finanzen' },
  { key: 'ai-assistant', label: 'KI-Assistent' },
  { key: 'scenarios', label: 'Szenarien-Planung' },
  { key: 'external-access', label: 'Externer Zugriff' },
]

function hasFeature(tierId: Tier, featureKey: string): boolean {
  return TIER_CONFIG[tierId].features.includes(featureKey)
}

function isCurrentTier(tierId: Tier): boolean {
  return tier.value === tierId
}

async function handleUpgrade(tierId: Tier): Promise<void> {
  await setTier(tierId)
}
</script>

<template>
  <div class="p-4 max-w-4xl mx-auto pb-24">
    <h2 class="text-2xl font-bold text-gray-800 mb-2">Abo verwalten</h2>
    <p class="text-gray-500 mb-6">Waehle den passenden Plan fuer deine Familie.</p>

    <!-- Tier Cards -->
    <div class="grid gap-4 md:grid-cols-3 mb-10">
      <div
        v-for="t in tiers"
        :key="t.id"
        class="relative rounded-xl border-2 p-5 transition-all"
        :class="[
          isCurrentTier(t.id)
            ? 'border-blue-500 bg-blue-50 shadow-lg'
            : t.highlight
              ? 'border-blue-300 bg-white shadow-md'
              : 'border-gray-200 bg-white shadow-sm',
        ]"
      >
        <!-- Current badge -->
        <div
          v-if="isCurrentTier(t.id)"
          class="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full"
        >
          Aktueller Plan
        </div>

        <!-- Popular badge -->
        <div
          v-if="t.highlight && !isCurrentTier(t.id)"
          class="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full"
        >
          Beliebt
        </div>

        <h3 class="text-lg font-bold text-gray-800 mt-2">{{ t.name }}</h3>
        <div class="mt-2 mb-1">
          <span class="text-3xl font-extrabold text-gray-900">{{ t.price }}</span>
        </div>
        <p class="text-sm text-gray-500 mb-4">{{ t.priceNote }}</p>

        <ul class="space-y-2 mb-6">
          <li
            v-for="feature in t.features"
            :key="feature"
            class="flex items-start gap-2 text-sm text-gray-700"
          >
            <svg class="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ feature }}
          </li>
        </ul>

        <button
          v-if="!isCurrentTier(t.id)"
          @click="handleUpgrade(t.id)"
          class="w-full py-2.5 rounded-lg font-medium transition-colors"
          :class="[
            t.highlight
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200',
          ]"
        >
          {{ t.id === 'free' ? 'Downgrade' : 'Upgrade' }}
        </button>
        <div
          v-else
          class="w-full py-2.5 rounded-lg font-medium text-center bg-blue-100 text-blue-700"
        >
          Aktiv
        </div>
      </div>
    </div>

    <!-- Feature Comparison Table -->
    <h3 class="text-xl font-bold text-gray-800 mb-4">Feature-Vergleich</h3>
    <div class="overflow-x-auto">
      <table class="w-full bg-white rounded-xl shadow-sm border border-gray-200">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Feature</th>
            <th
              v-for="t in tiers"
              :key="t.id"
              class="text-center py-3 px-4 text-sm font-semibold"
              :class="isCurrentTier(t.id) ? 'text-blue-600' : 'text-gray-600'"
            >
              {{ t.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(feature, idx) in allFeatures"
            :key="feature.key"
            :class="idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'"
          >
            <td class="py-2.5 px-4 text-sm text-gray-700">{{ feature.label }}</td>
            <td
              v-for="t in tiers"
              :key="t.id"
              class="text-center py-2.5 px-4"
            >
              <svg
                v-if="hasFeature(t.id, feature.key)"
                class="w-5 h-5 text-green-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg
                v-else
                class="w-5 h-5 text-gray-300 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </td>
          </tr>
          <!-- Limits rows -->
          <tr class="bg-gray-50">
            <td class="py-2.5 px-4 text-sm text-gray-700">Max. Mitglieder</td>
            <td class="text-center py-2.5 px-4 text-sm text-gray-600">2</td>
            <td class="text-center py-2.5 px-4 text-sm text-gray-600">6</td>
            <td class="text-center py-2.5 px-4 text-sm text-gray-600">6</td>
          </tr>
          <tr class="bg-white">
            <td class="py-2.5 px-4 text-sm text-gray-700">Max. Kinder</td>
            <td class="text-center py-2.5 px-4 text-sm text-gray-600">1</td>
            <td class="text-center py-2.5 px-4 text-sm text-gray-600">5</td>
            <td class="text-center py-2.5 px-4 text-sm text-gray-600">5</td>
          </tr>
          <tr class="bg-gray-50">
            <td class="py-2.5 px-4 text-sm text-gray-700">Historie</td>
            <td class="text-center py-2.5 px-4 text-sm text-gray-600">4 Wochen</td>
            <td class="text-center py-2.5 px-4 text-sm text-gray-600">Unbegrenzt</td>
            <td class="text-center py-2.5 px-4 text-sm text-gray-600">Unbegrenzt</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
