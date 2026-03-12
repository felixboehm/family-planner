<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Category } from '@/types/family'

const props = defineProps<{
  category?: Category
}>()

const emit = defineEmits<{
  save: [category: Omit<Category, 'id' | 'createdAt' | 'isDefault'>]
  cancel: []
}>()

const emoji = ref('')
const name = ref('')
const type = ref<'need' | 'wish'>('need')
const weight = ref('family')
const customWeight = ref('')
const visibility = ref<'personal' | 'family'>('family')

const weightOptions = [
  { value: 'family', label: 'Familienbeitrag' },
  { value: 'personal', label: 'Persoenlich' },
  { value: 'custom', label: 'Eigene...' },
]

// Populate form when editing
watch(
  () => props.category,
  (cat) => {
    if (cat) {
      emoji.value = cat.emoji
      name.value = cat.name
      type.value = cat.type
      visibility.value = cat.visibility
      if (cat.weight === 'family' || cat.weight === 'personal') {
        weight.value = cat.weight
        customWeight.value = ''
      } else {
        weight.value = 'custom'
        customWeight.value = cat.weight
      }
    }
  },
  { immediate: true },
)

function handleSubmit() {
  if (!emoji.value.trim() || !name.value.trim()) return

  const resolvedWeight = weight.value === 'custom' ? customWeight.value.trim() || 'personal' : weight.value

  emit('save', {
    emoji: emoji.value.trim(),
    name: name.value.trim(),
    type: type.value,
    weight: resolvedWeight,
    visibility: visibility.value,
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Emoji -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
      <input
        v-model="emoji"
        type="text"
        maxlength="4"
        placeholder="z.B. 🎵"
        class="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center text-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <!-- Name -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
      <input
        v-model="name"
        type="text"
        required
        placeholder="Kategoriename"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <!-- Type toggle -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Typ</label>
      <div class="flex gap-2">
        <button
          type="button"
          @click="type = 'need'"
          class="flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors"
          :class="[
            type === 'need'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 text-gray-600 hover:border-gray-300',
          ]"
        >
          🔵 Bedarf
        </button>
        <button
          type="button"
          @click="type = 'wish'"
          class="flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors"
          :class="[
            type === 'wish'
              ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
              : 'border-gray-200 text-gray-600 hover:border-gray-300',
          ]"
        >
          🟡 Wunsch
        </button>
      </div>
    </div>

    <!-- Weight dropdown -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Gewichtung</label>
      <select
        v-model="weight"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option v-for="opt in weightOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <input
        v-if="weight === 'custom'"
        v-model="customWeight"
        type="text"
        placeholder="Eigene Gewichtung"
        class="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <!-- Visibility toggle -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Sichtbarkeit</label>
      <div class="flex gap-2">
        <button
          type="button"
          @click="visibility = 'family'"
          class="flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors"
          :class="[
            visibility === 'family'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 text-gray-600 hover:border-gray-300',
          ]"
        >
          👨‍👩‍👧 Familie
        </button>
        <button
          type="button"
          @click="visibility = 'personal'"
          class="flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors"
          :class="[
            visibility === 'personal'
              ? 'border-purple-500 bg-purple-50 text-purple-700'
              : 'border-gray-200 text-gray-600 hover:border-gray-300',
          ]"
        >
          👤 Persoenlich
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-3 pt-2">
      <button
        type="button"
        @click="emit('cancel')"
        class="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Abbrechen
      </button>
      <button
        type="submit"
        class="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
      >
        {{ category ? 'Speichern' : 'Erstellen' }}
      </button>
    </div>
  </form>
</template>
