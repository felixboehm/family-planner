<script setup lang="ts">
import { computed } from 'vue'
import type { FairnessResult } from '@/lib/fairnessCalc'
import type { Member } from '@/types/family'
import MetricBar from './MetricBar.vue'

const props = defineProps<{
  result: FairnessResult
  members: Record<string, Member>
}>()

const scoreColor = computed(() => {
  const score = props.result.overallScore
  if (score > 70) return '#22c55e' // green
  if (score > 40) return '#eab308' // yellow
  return '#ef4444' // red
})

const scoreColorClass = computed(() => {
  const score = props.result.overallScore
  if (score > 70) return 'text-green-500'
  if (score > 40) return 'text-yellow-500'
  return 'text-red-500'
})

const scoreBgClass = computed(() => {
  const score = props.result.overallScore
  if (score > 70) return 'bg-green-50 border-green-200'
  if (score > 40) return 'bg-yellow-50 border-yellow-200'
  return 'bg-red-50 border-red-200'
})

// circumference for the SVG ring (radius = 54)
const circumference = 2 * Math.PI * 54
const strokeDashoffset = computed(() => {
  const pct = props.result.overallScore / 100
  return circumference * (1 - pct)
})

// Find max hours across all metrics for consistent bar scaling
const maxHours = computed(() => {
  if (props.result.metrics.length === 0) return 10
  const allValues = props.result.metrics.flatMap((m) => [
    m.familyContribution,
    m.personalNeed,
    m.personalWish,
  ])
  const max = Math.max(...allValues)
  return Math.max(max, 1) // at least 1 to avoid division by zero
})

// Contribution delta description
const contributionDeltaText = computed(() => {
  const metrics = props.result.metrics
  if (metrics.length < 2) return null
  if (props.result.contributionDelta < 0.5) return null

  // Find member with highest and lowest contribution
  const sorted = [...metrics].sort((a, b) => b.familyContribution - a.familyContribution)
  const high = sorted[0]
  const low = sorted[sorted.length - 1]
  const delta = props.result.contributionDelta

  return `${high.memberName} leistet ${delta}h mehr als ${low.memberName}`
})

function getMemberColor(memberId: string): string {
  return props.members[memberId]?.color ?? '#6b7280'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Overall Score Ring -->
    <div :class="['rounded-xl border p-6 flex flex-col items-center', scoreBgClass]">
      <p class="text-sm font-medium text-gray-600 mb-3">Fairness-Score</p>
      <div class="relative w-32 h-32">
        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <!-- Background ring -->
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#e5e7eb"
            stroke-width="8"
          />
          <!-- Score ring -->
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            :stroke="scoreColor"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashoffset"
            class="transition-all duration-700 ease-out"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <span :class="['text-3xl font-bold', scoreColorClass]">
            {{ result.overallScore }}
          </span>
        </div>
      </div>
      <p class="text-xs text-gray-500 mt-2">von 100 Punkten</p>
    </div>

    <!-- Contribution Delta Indicator -->
    <div
      v-if="contributionDeltaText"
      class="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm text-orange-800"
    >
      {{ contributionDeltaText }}
    </div>

    <!-- Per-Member Breakdown -->
    <div
      v-for="metric in result.metrics"
      :key="metric.memberId"
      class="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
    >
      <!-- Member Header -->
      <div class="flex items-center gap-2 mb-1">
        <span
          class="w-3 h-3 rounded-full shrink-0"
          :style="{ backgroundColor: getMemberColor(metric.memberId) }"
        />
        <span class="font-semibold text-gray-800">{{ metric.memberName }}</span>
      </div>

      <!-- Metric Bars -->
      <MetricBar
        label="Familienbeitrag"
        :value="metric.familyContribution"
        :max="maxHours"
        :color="getMemberColor(metric.memberId)"
      />
      <MetricBar
        label="Privatzeit (Bedarf)"
        :value="metric.personalNeed"
        :max="maxHours"
        color="#6366f1"
      />
      <MetricBar
        label="Privatzeit (Wunsch)"
        :value="metric.personalWish"
        :max="maxHours"
        color="#a855f7"
      />

      <!-- Wish Fulfillment -->
      <div class="flex items-center justify-between pt-1">
        <span class="text-sm text-gray-500">Wunsch-Erfuellung</span>
        <span
          class="text-sm font-medium"
          :class="{
            'text-green-600': metric.wishFulfillmentRate >= 0.7,
            'text-yellow-600': metric.wishFulfillmentRate >= 0.4 && metric.wishFulfillmentRate < 0.7,
            'text-red-600': metric.wishFulfillmentRate < 0.4,
          }"
        >
          {{ Math.round(metric.wishFulfillmentRate * 100) }}%
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="result.metrics.length === 0"
      class="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500"
    >
      <p>Keine Mitglieder vorhanden. Fuege zuerst Familienmitglieder hinzu.</p>
    </div>
  </div>
</template>
