<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FixedCost } from '@/types/finance'
import { useFinance } from '@/composables/useFinance'

const { fixedCosts, addFixedCost, updateFixedCost, removeFixedCost } = useFinance()

const editingId = ref<string | null>(null)
const showForm = ref(false)

// Form fields
const name = ref('')
const amount = ref(0)
const category = ref<FixedCost['category']>('other')

const categoryLabels: Record<FixedCost['category'], string> = {
  housing: 'Wohnen',
  insurance: 'Versicherung',
  transport: 'Mobiliaet',
  subscriptions: 'Abos',
  food: 'Lebensmittel',
  other: 'Sonstiges',
}

const categoryEmojis: Record<FixedCost['category'], string> = {
  housing: '\uD83C\uDFE0',
  insurance: '\uD83D\uDEE1\uFE0F',
  transport: '\uD83D\uDE97',
  subscriptions: '\uD83D\uDCF1',
  food: '\uD83D\uDED2',
  other: '\uD83D\uDCCC',
}

const costList = computed(() =>
  Object.values(fixedCosts.value).sort((a, b) => a.createdAt - b.createdAt),
)

const totalCosts = computed(() =>
  costList.value.reduce((sum, c) => sum + c.amount, 0),
)

function resetForm() {
  name.value = ''
  amount.value = 0
  category.value = 'other'
  editingId.value = null
  showForm.value = false
}

function openNew() {
  resetForm()
  showForm.value = true
}

function openEdit(cost: FixedCost) {
  editingId.value = cost.id
  name.value = cost.name
  amount.value = cost.amount
  category.value = cost.category
  showForm.value = true
}

function handleSave() {
  if (!name.value.trim() || amount.value <= 0) return

  if (editingId.value) {
    updateFixedCost(editingId.value, {
      name: name.value.trim(),
      amount: amount.value,
      category: category.value,
    })
  } else {
    addFixedCost({
      name: name.value.trim(),
      amount: amount.value,
      category: category.value,
    })
  }

  resetForm()
}

function handleRemove(id: string) {
  removeFixedCost(id)
}

function formatCurrency(val: number): string {
  return val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-semibold text-gray-800">Fixkosten</h3>
      <button
        @click="openNew"
        class="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
      >
        + Hinzufuegen
      </button>
    </div>

    <!-- Cost list -->
    <div v-if="costList.length > 0" class="space-y-2 mb-3">
      <div
        v-for="cost in costList"
        :key="cost.id"
        class="bg-white rounded-lg shadow-sm p-3 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <span class="text-xl">{{ categoryEmojis[cost.category] }}</span>
          <div>
            <div class="font-medium text-gray-800">{{ cost.name }}</div>
            <div class="text-sm text-gray-500">{{ categoryLabels[cost.category] }}</div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-semibold text-red-500">-{{ formatCurrency(cost.amount) }}</span>
          <div class="flex gap-1">
            <button
              @click="openEdit(cost)"
              class="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
              title="Bearbeiten"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              @click="handleRemove(cost.id)"
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

      <!-- Total -->
      <div class="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
        <span class="font-medium text-gray-600">Gesamt Fixkosten</span>
        <span class="font-bold text-red-600">-{{ formatCurrency(totalCosts) }}</span>
      </div>
    </div>
    <div v-else class="bg-white rounded-lg shadow-sm p-4 text-center text-gray-400 mb-4">
      Noch keine Fixkosten erfasst.
    </div>

    <!-- Form -->
    <div v-if="showForm" class="bg-white rounded-lg shadow-sm p-4 space-y-4">
      <h4 class="font-medium text-gray-700">
        {{ editingId ? 'Fixkosten bearbeiten' : 'Neue Fixkosten' }}
      </h4>

      <!-- Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Bezeichnung</label>
        <input
          v-model="name"
          type="text"
          placeholder="z.B. Miete, Strom, ..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <!-- Amount -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Betrag (EUR / Monat)</label>
        <input
          v-model.number="amount"
          type="number"
          min="0"
          step="1"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <!-- Category -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
        <select
          v-model="category"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          <option v-for="(label, key) in categoryLabels" :key="key" :value="key">
            {{ categoryEmojis[key as FixedCost['category']] }} {{ label }}
          </option>
        </select>
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
          :disabled="!name.trim() || amount <= 0"
          class="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium transition-colors"
          :class="[name.trim() && amount > 0 ? 'hover:bg-blue-600' : 'opacity-50 cursor-not-allowed']"
        >
          Speichern
        </button>
      </div>
    </div>
  </div>
</template>
