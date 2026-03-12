<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { FamilyEvent } from '@/types/family'
import { useCategories } from '@/composables/useCategories'
import CategoryPicker from '@/components/CategoryPicker.vue'

const props = defineProps<{
  event?: FamilyEvent
  memberId: string
}>()

const emit = defineEmits<{
  save: [data: Omit<FamilyEvent, 'id' | 'createdAt'>]
  cancel: []
}>()

const { getCategoryById } = useCategories()

const title = ref(props.event?.title ?? '')
const categoryId = ref(props.event?.categoryId ?? '')
const type = ref<'need' | 'wish'>(props.event?.type ?? 'need')
const selectedDays = ref<number[]>(props.event?.days ?? [])
const startTime = ref(props.event?.startTime ?? '08:00')
const endTime = ref(props.event?.endTime ?? '09:00')
const recurrence = ref<'daily' | 'weekly' | 'biweekly'>(props.event?.recurrence ?? 'weekly')
const endDate = ref(props.event?.endDate ?? '')
const typeOverridden = ref(false)

const dayLabels = [
  { value: 1, label: 'Mo' },
  { value: 2, label: 'Di' },
  { value: 3, label: 'Mi' },
  { value: 4, label: 'Do' },
  { value: 5, label: 'Fr' },
  { value: 6, label: 'Sa' },
  { value: 0, label: 'So' },
]

// Auto-fill type from selected category (unless user overrode it)
watch(categoryId, (newCatId) => {
  if (!typeOverridden.value && newCatId) {
    const cat = getCategoryById(newCatId)
    if (cat) {
      type.value = cat.type
    }
  }
})

function toggleDay(day: number) {
  const idx = selectedDays.value.indexOf(day)
  if (idx >= 0) {
    selectedDays.value = selectedDays.value.filter((d) => d !== day)
  } else {
    selectedDays.value = [...selectedDays.value, day]
  }
}

function overrideType(t: 'need' | 'wish') {
  type.value = t
  typeOverridden.value = true
}

const isValid = computed(() => {
  return (
    title.value.trim().length > 0 &&
    categoryId.value.length > 0 &&
    selectedDays.value.length > 0 &&
    startTime.value < endTime.value
  )
})

function handleSave() {
  if (!isValid.value) return

  emit('save', {
    memberId: props.memberId,
    title: title.value.trim(),
    categoryId: categoryId.value,
    type: type.value,
    days: selectedDays.value,
    startTime: startTime.value,
    endTime: endTime.value,
    recurrence: recurrence.value,
    endDate: endDate.value || undefined,
  })
}
</script>

<template>
  <div class="space-y-5">
    <!-- Title -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Titel</label>
      <input
        v-model="title"
        type="text"
        placeholder="z.B. Yoga, Arbeitszeit, ..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
    </div>

    <!-- Category -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
      <CategoryPicker v-model="categoryId" />
    </div>

    <!-- Type toggle -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Typ</label>
      <div class="flex gap-2">
        <button
          type="button"
          @click="overrideType('need')"
          class="flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors"
          :class="[
            type === 'need'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
          ]"
        >
          Bedürfnis
        </button>
        <button
          type="button"
          @click="overrideType('wish')"
          class="flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors"
          :class="[
            type === 'wish'
              ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
          ]"
        >
          Wunsch
        </button>
      </div>
    </div>

    <!-- Day selection -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Tage</label>
      <div class="flex gap-1.5">
        <button
          v-for="d in dayLabels"
          :key="d.value"
          type="button"
          @click="toggleDay(d.value)"
          class="w-10 h-10 rounded-full text-sm font-medium transition-colors"
          :class="[
            selectedDays.includes(d.value)
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          ]"
        >
          {{ d.label }}
        </button>
      </div>
    </div>

    <!-- Time range -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Von</label>
        <input
          v-model="startTime"
          type="time"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Bis</label>
        <input
          v-model="endTime"
          type="time"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>
    </div>

    <!-- Recurrence -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Wiederholung</label>
      <select
        v-model="recurrence"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
      >
        <option value="daily">Täglich</option>
        <option value="weekly">Wöchentlich</option>
        <option value="biweekly">Alle 2 Wochen</option>
      </select>
    </div>

    <!-- End date (optional) -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Enddatum (optional)</label>
      <input
        v-model="endDate"
        type="date"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
    </div>

    <!-- Actions -->
    <div class="flex gap-3 pt-2">
      <button
        type="button"
        @click="emit('cancel')"
        class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
      >
        Abbrechen
      </button>
      <button
        type="button"
        @click="handleSave"
        :disabled="!isValid"
        class="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium transition-colors"
        :class="[isValid ? 'hover:bg-blue-600' : 'opacity-50 cursor-not-allowed']"
      >
        Speichern
      </button>
    </div>
  </div>
</template>
