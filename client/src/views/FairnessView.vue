<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFairness } from '@/composables/useFairness'
import { useFamily } from '@/composables/useFamily'
import FairnessDashboard from '@/components/FairnessDashboard.vue'

const router = useRouter()
const { members } = useFamily()
const {
  selectedWeekMetrics,
  selectedWeekLabel,
  weekOffset,
  navigateWeek,
} = useFairness()

const scoreExplanation = computed(() => {
  const score = selectedWeekMetrics.value.overallScore
  if (score > 85) {
    return 'Die Verteilung sieht diese Woche sehr ausgewogen aus. Weiter so!'
  }
  if (score > 70) {
    return 'Die Aufteilung ist insgesamt fair. Kleine Anpassungen koennten helfen.'
  }
  if (score > 40) {
    return 'Es gibt merkliche Unterschiede in der Verteilung. Vielleicht lohnt sich ein Gespraech darueber.'
  }
  return 'Die Verteilung ist diese Woche deutlich ungleich. Ein Tauschangebot koennte helfen, die Balance zu verbessern.'
})

const showSwapSuggestion = computed(() => {
  return selectedWeekMetrics.value.overallScore < 70 && selectedWeekMetrics.value.metrics.length >= 2
})

function goToSwapRequest() {
  router.push('/requests')
}
</script>

<template>
  <div class="p-4 max-w-2xl mx-auto space-y-6">
    <!-- Header -->
    <h2 class="text-2xl font-bold text-gray-800">Fairness-Score</h2>

    <!-- Week Navigation -->
    <div class="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
      <button
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        aria-label="Vorherige Woche"
        @click="navigateWeek(-1)"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span class="font-medium text-gray-700">{{ selectedWeekLabel }}</span>
      <button
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        :class="{ 'opacity-30 cursor-not-allowed': weekOffset >= 0 }"
        :disabled="weekOffset >= 0"
        aria-label="Naechste Woche"
        @click="navigateWeek(1)"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Dashboard -->
    <FairnessDashboard
      :result="selectedWeekMetrics"
      :members="members"
    />

    <!-- Summary Text -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
      {{ scoreExplanation }}
    </div>

    <!-- Swap Suggestion -->
    <div
      v-if="showSwapSuggestion"
      class="bg-white border border-gray-200 rounded-lg p-4"
    >
      <p class="text-sm text-gray-600 mb-3">
        Es gibt ein Ungleichgewicht in der aktuellen Woche. Du kannst einen Tauschvorschlag erstellen, um die Aufgaben besser zu verteilen.
      </p>
      <button
        class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        @click="goToSwapRequest"
      >
        Tauschvorschlag erstellen
      </button>
    </div>
  </div>
</template>
