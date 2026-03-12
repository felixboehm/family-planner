<script setup lang="ts">
import { useFamily } from '@/composables/useFamily'
import { useFinance } from '@/composables/useFinance'
import IncomeEditor from '@/components/IncomeEditor.vue'
import CostEditor from '@/components/CostEditor.vue'
import ScenarioComparison from '@/components/ScenarioComparison.vue'

const { members } = useFamily()
const { summary } = useFinance()

function getMemberName(memberId: string): string {
  return members.value[memberId]?.name ?? 'Unbekannt'
}

function getMemberColor(memberId: string): string {
  return members.value[memberId]?.color ?? '#3b82f6'
}

function formatCurrency(val: number): string {
  return val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}
</script>

<template>
  <div class="p-4 max-w-lg mx-auto pb-24">
    <h2 class="text-2xl font-bold text-gray-800 mb-4">Finanzen</h2>

    <!-- Summary card -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Monatliche Uebersicht</h3>

      <div class="grid grid-cols-3 gap-3 mb-4">
        <div class="text-center">
          <div class="text-xs text-gray-500 mb-1">Nettoeinkommen</div>
          <div class="text-lg font-bold text-green-600">
            {{ formatCurrency(summary.totalNetIncome) }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-500 mb-1">Ausgaben</div>
          <div class="text-lg font-bold text-red-500">
            {{ formatCurrency(summary.totalFixedCosts + summary.totalCareExpenses) }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-500 mb-1">Verfuegbar</div>
          <div
            class="text-lg font-bold"
            :class="summary.availableBudget >= 0 ? 'text-blue-600' : 'text-red-600'"
          >
            {{ formatCurrency(summary.availableBudget) }}
          </div>
        </div>
      </div>

      <!-- Budget bar -->
      <div class="h-3 bg-gray-100 rounded-full overflow-hidden flex">
        <div
          v-if="summary.totalNetIncome > 0"
          class="bg-red-400 h-full"
          :style="{ width: Math.min((summary.totalFixedCosts / summary.totalNetIncome) * 100, 100) + '%' }"
        />
        <div
          v-if="summary.totalNetIncome > 0"
          class="bg-orange-400 h-full"
          :style="{ width: Math.min((summary.totalCareExpenses / summary.totalNetIncome) * 100, 100) + '%' }"
        />
        <div
          v-if="summary.availableBudget > 0 && summary.totalNetIncome > 0"
          class="bg-green-400 h-full"
          :style="{ width: (summary.availableBudget / summary.totalNetIncome) * 100 + '%' }"
        />
      </div>
      <div class="flex justify-between text-xs text-gray-400 mt-1">
        <span>Fixkosten</span>
        <span>Betreuung</span>
        <span>Frei</span>
      </div>

      <!-- Per-member breakdown -->
      <div
        v-if="Object.keys(summary.incomeByMember).length > 0"
        class="mt-4 pt-3 border-t border-gray-100"
      >
        <div class="text-xs text-gray-500 mb-2">Einkommen nach Mitglied</div>
        <div class="space-y-1">
          <div
            v-for="(income, memberId) in summary.incomeByMember"
            :key="memberId"
            class="flex items-center justify-between text-sm"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-2.5 h-2.5 rounded-full"
                :style="{ backgroundColor: getMemberColor(String(memberId)) }"
              />
              <span class="text-gray-600">{{ getMemberName(String(memberId)) }}</span>
            </div>
            <span class="font-medium text-gray-800">{{ formatCurrency(income.net) }} netto</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Income section -->
    <div class="mb-6">
      <IncomeEditor />
    </div>

    <!-- Fixed costs section -->
    <div class="mb-6">
      <CostEditor />
    </div>

    <!-- Scenario comparison -->
    <div class="mb-6">
      <ScenarioComparison />
    </div>
  </div>
</template>
