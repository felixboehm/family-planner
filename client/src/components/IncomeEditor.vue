<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EmploymentType, IncomeProfile } from '@/types/finance'
import { useFamily } from '@/composables/useFamily'
import { useFinance } from '@/composables/useFinance'
import { calculateNetIncome } from '@/lib/financeCalc'

const { members } = useFamily()
const { incomes, addIncome, updateIncome, removeIncome } = useFinance()

const editingId = ref<string | null>(null)
const showForm = ref(false)

// Form fields
const selectedMemberId = ref('')
const hourlyRate = ref(0)
const hoursPerWeek = ref(0)
const taxRate = ref(30)
const employmentType = ref<EmploymentType>('employed')

const memberList = computed(() => Object.values(members.value))
const incomeList = computed(() =>
  Object.values(incomes.value).sort((a, b) => a.createdAt - b.createdAt),
)

const typeLabels: Record<EmploymentType, string> = {
  'employed': 'Angestellt',
  'self-employed': 'Selbststaendig',
  'freelance': 'Freiberuflich',
  'part-time': 'Teilzeit',
  'mini-job': 'Minijob',
}

const previewIncome = computed(() => {
  if (hourlyRate.value <= 0 || hoursPerWeek.value <= 0) return null
  return calculateNetIncome({
    id: '',
    memberId: '',
    hourlyRate: hourlyRate.value,
    hoursPerWeek: hoursPerWeek.value,
    taxRate: taxRate.value,
    type: employmentType.value,
    createdAt: 0,
  })
})

function getMemberName(memberId: string): string {
  return members.value[memberId]?.name ?? 'Unbekannt'
}

function getMemberColor(memberId: string): string {
  return members.value[memberId]?.color ?? '#3b82f6'
}

function resetForm() {
  selectedMemberId.value = memberList.value[0]?.id ?? ''
  hourlyRate.value = 0
  hoursPerWeek.value = 0
  taxRate.value = 30
  employmentType.value = 'employed'
  editingId.value = null
  showForm.value = false
}

function openNew() {
  resetForm()
  selectedMemberId.value = memberList.value[0]?.id ?? ''
  showForm.value = true
}

function openEdit(income: IncomeProfile) {
  editingId.value = income.id
  selectedMemberId.value = income.memberId
  hourlyRate.value = income.hourlyRate
  hoursPerWeek.value = income.hoursPerWeek
  taxRate.value = income.taxRate
  employmentType.value = income.type
  showForm.value = true
}

function handleSave() {
  if (!selectedMemberId.value || hourlyRate.value <= 0 || hoursPerWeek.value <= 0) return

  if (editingId.value) {
    updateIncome(editingId.value, {
      memberId: selectedMemberId.value,
      hourlyRate: hourlyRate.value,
      hoursPerWeek: hoursPerWeek.value,
      taxRate: taxRate.value,
      type: employmentType.value,
    })
  } else {
    addIncome({
      memberId: selectedMemberId.value,
      hourlyRate: hourlyRate.value,
      hoursPerWeek: hoursPerWeek.value,
      taxRate: taxRate.value,
      type: employmentType.value,
    })
  }

  resetForm()
}

function handleRemove(id: string) {
  removeIncome(id)
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-semibold text-gray-800">Einkommen</h3>
      <button
        @click="openNew"
        class="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
      >
        + Hinzufuegen
      </button>
    </div>

    <!-- Income list -->
    <div v-if="incomeList.length > 0" class="space-y-2 mb-4">
      <div
        v-for="income in incomeList"
        :key="income.id"
        class="bg-white rounded-lg shadow-sm p-3 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-3 h-3 rounded-full"
            :style="{ backgroundColor: getMemberColor(income.memberId) }"
          />
          <div>
            <div class="font-medium text-gray-800">{{ getMemberName(income.memberId) }}</div>
            <div class="text-sm text-gray-500">
              {{ typeLabels[income.type] }} &middot;
              {{ income.hoursPerWeek }}h/Woche &middot;
              {{ formatCurrency(income.hourlyRate) }}/h
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right">
            <div class="font-semibold text-green-600">
              {{ formatCurrency(calculateNetIncome(income).net) }}
            </div>
            <div class="text-xs text-gray-400">netto/Monat</div>
          </div>
          <div class="flex gap-1">
            <button
              @click="openEdit(income)"
              class="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
              title="Bearbeiten"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              @click="handleRemove(income.id)"
              class="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              title="Entfernen"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="bg-white rounded-lg shadow-sm p-4 text-center text-gray-400 mb-4">
      Noch kein Einkommen erfasst.
    </div>

    <!-- Form -->
    <div v-if="showForm" class="bg-white rounded-lg shadow-sm p-4 space-y-4">
      <h4 class="font-medium text-gray-700">
        {{ editingId ? 'Einkommen bearbeiten' : 'Neues Einkommen' }}
      </h4>

      <!-- Member -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Familienmitglied</label>
        <select
          v-model="selectedMemberId"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          <option v-for="m in memberList" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </div>

      <!-- Employment type -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Beschaeftigungsart</label>
        <select
          v-model="employmentType"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          <option v-for="(label, key) in typeLabels" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>

      <!-- Hourly rate -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Stundenlohn (EUR)</label>
        <input
          v-model.number="hourlyRate"
          type="number"
          min="0"
          step="0.5"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <!-- Hours per week -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Stunden pro Woche</label>
        <input
          v-model.number="hoursPerWeek"
          type="number"
          min="0"
          max="80"
          step="0.5"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <!-- Tax rate -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Abgabenquote (%) <span class="text-gray-400 font-normal">Steuern + Sozialabgaben</span>
        </label>
        <input
          v-model.number="taxRate"
          type="number"
          min="0"
          max="100"
          step="1"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <!-- Preview -->
      <div v-if="previewIncome" class="bg-gray-50 rounded-lg p-3">
        <div class="text-sm text-gray-500 mb-1">Vorschau (monatlich)</div>
        <div class="flex justify-between">
          <span class="text-gray-600">Brutto:</span>
          <span class="font-medium">{{ formatCurrency(previewIncome.gross) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Netto:</span>
          <span class="font-semibold text-green-600">{{ formatCurrency(previewIncome.net) }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-1">
        <button
          @click="resetForm"
          class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Abbrechen
        </button>
        <button
          @click="handleSave"
          :disabled="!selectedMemberId || hourlyRate <= 0 || hoursPerWeek <= 0"
          class="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium transition-colors"
          :class="[selectedMemberId && hourlyRate > 0 && hoursPerWeek > 0 ? 'hover:bg-blue-600' : 'opacity-50 cursor-not-allowed']"
        >
          Speichern
        </button>
      </div>
    </div>
  </div>
</template>
