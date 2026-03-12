<script setup lang="ts">
import { ref, computed } from 'vue'
import type { IncomeProfile, CareExpense, Scenario } from '@/types/finance'
import { useFamily } from '@/composables/useFamily'
import { useFinance } from '@/composables/useFinance'
import { useChildren } from '@/composables/useChildren'
import { calculateScenario } from '@/lib/financeCalc'

const { members } = useFamily()
const { incomes, fixedCosts, careExpenses, summary } = useFinance()
const { children } = useChildren()

const showScenario = ref(false)

// Scenario adjustments
const adjustedHours = ref<Record<string, number>>({})
const adjustedCareExpenseCosts = ref<Record<string, number>>({})

const incomeList = computed(() => Object.values(incomes.value))
const careExpenseList = computed(() => Object.values(careExpenses.value))

function getMemberName(memberId: string): string {
  return members.value[memberId]?.name ?? 'Unbekannt'
}

function getChildName(childId: string): string {
  return children.value[childId]?.name ?? 'Unbekannt'
}

function initScenario() {
  adjustedHours.value = {}
  adjustedCareExpenseCosts.value = {}

  for (const income of incomeList.value) {
    adjustedHours.value[income.id] = income.hoursPerWeek
  }
  for (const expense of careExpenseList.value) {
    adjustedCareExpenseCosts.value[expense.id] = expense.monthlyCost
  }

  showScenario.value = true
}

const scenario = computed<Scenario>(() => {
  const adjustedIncomes: Scenario['adjustedIncomes'] = {}
  const adjustedCareExpenseMap: Scenario['adjustedCareExpenses'] = {}

  for (const income of incomeList.value) {
    const newHours = adjustedHours.value[income.id]
    if (newHours !== undefined && newHours !== income.hoursPerWeek) {
      adjustedIncomes[income.id] = { hoursPerWeek: newHours }
    }
  }

  for (const expense of careExpenseList.value) {
    const newCost = adjustedCareExpenseCosts.value[expense.id]
    if (newCost !== undefined && newCost !== expense.monthlyCost) {
      adjustedCareExpenseMap[expense.id] = { monthlyCost: newCost }
    }
  }

  return {
    id: 'scenario-1',
    name: 'Was waere wenn...',
    adjustedIncomes,
    adjustedCareExpenses: adjustedCareExpenseMap,
  }
})

const scenarioSummary = computed(() => {
  return calculateScenario(
    incomeList.value,
    Object.values(fixedCosts.value),
    careExpenseList.value,
    scenario.value,
  )
})

const budgetDiff = computed(() => {
  return scenarioSummary.value.availableBudget - summary.value.availableBudget
})

function formatCurrency(val: number): string {
  return val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-semibold text-gray-800">Was waere wenn...</h3>
      <button
        v-if="!showScenario"
        @click="initScenario"
        :disabled="incomeList.length === 0"
        class="px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Szenario starten
      </button>
      <button
        v-else
        @click="showScenario = false"
        class="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
      >
        Schliessen
      </button>
    </div>

    <div v-if="!showScenario" class="bg-white rounded-lg shadow-sm p-4 text-center text-gray-400">
      <p class="mb-1">Simuliere Aenderungen an Arbeitszeiten oder Betreuungskosten.</p>
      <p class="text-sm">Vergleiche das Ergebnis mit der aktuellen Situation.</p>
    </div>

    <div v-else class="space-y-4">
      <!-- Income adjustments -->
      <div v-if="incomeList.length > 0" class="bg-white rounded-lg shadow-sm p-4">
        <h4 class="font-medium text-gray-700 mb-3">Arbeitszeiten anpassen</h4>
        <div class="space-y-3">
          <div v-for="income in incomeList" :key="income.id" class="flex items-center gap-3">
            <span class="text-sm text-gray-600 w-28 truncate">{{ getMemberName(income.memberId) }}</span>
            <input
              v-model.number="adjustedHours[income.id]"
              type="range"
              :min="0"
              :max="60"
              step="1"
              class="flex-1"
            />
            <span class="text-sm font-medium w-16 text-right">
              {{ adjustedHours[income.id] ?? income.hoursPerWeek }}h/Wo
            </span>
            <span
              v-if="(adjustedHours[income.id] ?? income.hoursPerWeek) !== income.hoursPerWeek"
              class="text-xs text-purple-500"
            >
              (war {{ income.hoursPerWeek }}h)
            </span>
          </div>
        </div>
      </div>

      <!-- Care expense adjustments -->
      <div v-if="careExpenseList.length > 0" class="bg-white rounded-lg shadow-sm p-4">
        <h4 class="font-medium text-gray-700 mb-3">Betreuungskosten anpassen</h4>
        <div class="space-y-3">
          <div v-for="expense in careExpenseList" :key="expense.id">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-600">
                {{ expense.provider }} ({{ getChildName(expense.childId) }})
              </span>
              <span
                v-if="(adjustedCareExpenseCosts[expense.id] ?? expense.monthlyCost) !== expense.monthlyCost"
                class="text-xs text-purple-500"
              >
                war {{ formatCurrency(expense.monthlyCost) }}
              </span>
            </div>
            <div class="flex items-center gap-3">
              <input
                v-model.number="adjustedCareExpenseCosts[expense.id]"
                type="number"
                min="0"
                step="10"
                class="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
              <span class="text-sm text-gray-500">EUR/Monat</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Side-by-side comparison -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Current -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <h4 class="font-medium text-gray-600 mb-3 text-sm uppercase tracking-wide">Aktuell</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Netto:</span>
              <span class="font-medium">{{ formatCurrency(summary.totalNetIncome) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Fixkosten:</span>
              <span class="font-medium text-red-500">-{{ formatCurrency(summary.totalFixedCosts) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Betreuung:</span>
              <span class="font-medium text-red-500">-{{ formatCurrency(summary.totalCareExpenses) }}</span>
            </div>
            <hr class="border-gray-200" />
            <div class="flex justify-between">
              <span class="font-medium text-gray-700">Budget:</span>
              <span
                class="font-bold"
                :class="summary.availableBudget >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ formatCurrency(summary.availableBudget) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Scenario -->
        <div class="bg-purple-50 rounded-lg shadow-sm p-4 border border-purple-200">
          <h4 class="font-medium text-purple-700 mb-3 text-sm uppercase tracking-wide">Szenario</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Netto:</span>
              <span class="font-medium">{{ formatCurrency(scenarioSummary.totalNetIncome) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Fixkosten:</span>
              <span class="font-medium text-red-500">-{{ formatCurrency(scenarioSummary.totalFixedCosts) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Betreuung:</span>
              <span class="font-medium text-red-500">-{{ formatCurrency(scenarioSummary.totalCareExpenses) }}</span>
            </div>
            <hr class="border-purple-200" />
            <div class="flex justify-between">
              <span class="font-medium text-gray-700">Budget:</span>
              <span
                class="font-bold"
                :class="scenarioSummary.availableBudget >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ formatCurrency(scenarioSummary.availableBudget) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Difference -->
      <div
        class="rounded-lg p-3 text-center font-semibold"
        :class="budgetDiff >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
      >
        Differenz: {{ budgetDiff >= 0 ? '+' : '' }}{{ formatCurrency(budgetDiff) }} / Monat
      </div>
    </div>
  </div>
</template>
