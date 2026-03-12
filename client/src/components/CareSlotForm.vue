<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CareSlot, Member } from '@/types/family'

const props = defineProps<{
  slot?: CareSlot
  childId: string
  members: Record<string, Member>
}>()

const emit = defineEmits<{
  save: [data: Omit<CareSlot, 'id' | 'createdAt'>]
  cancel: []
}>()

const assignedTo = ref(props.slot?.assignedTo ?? '')
const externalName = ref(props.slot?.externalName ?? '')
const selectedDays = ref<number[]>(props.slot?.days ?? [])
const startTime = ref(props.slot?.startTime ?? '08:00')
const endTime = ref(props.slot?.endTime ?? '16:00')
const recurrence = ref<'daily' | 'weekly' | 'biweekly'>(props.slot?.recurrence ?? 'weekly')

const dayLabels = [
  { value: 1, label: 'Mo' },
  { value: 2, label: 'Di' },
  { value: 3, label: 'Mi' },
  { value: 4, label: 'Do' },
  { value: 5, label: 'Fr' },
  { value: 6, label: 'Sa' },
  { value: 0, label: 'So' },
]

const assignOptions = computed(() => {
  const options: { value: string; label: string }[] = []
  for (const member of Object.values(props.members)) {
    options.push({ value: member.id, label: member.name })
  }
  options.push({ value: 'both', label: 'Beide' })
  options.push({ value: 'external', label: 'Extern' })
  return options
})

function toggleDay(day: number) {
  const idx = selectedDays.value.indexOf(day)
  if (idx >= 0) {
    selectedDays.value = selectedDays.value.filter((d) => d !== day)
  } else {
    selectedDays.value = [...selectedDays.value, day]
  }
}

const isValid = computed(() => {
  return (
    assignedTo.value.length > 0 &&
    selectedDays.value.length > 0 &&
    startTime.value < endTime.value &&
    (assignedTo.value !== 'external' || externalName.value.trim().length > 0)
  )
})

function handleSave() {
  if (!isValid.value) return

  emit('save', {
    childId: props.childId,
    assignedTo: assignedTo.value,
    externalName: assignedTo.value === 'external' ? externalName.value.trim() : undefined,
    days: selectedDays.value,
    startTime: startTime.value,
    endTime: endTime.value,
    recurrence: recurrence.value,
  })
}
</script>

<template>
  <div class="space-y-5">
    <!-- Assigned to -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Betreut von</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="opt in assignOptions"
          :key="opt.value"
          type="button"
          @click="assignedTo = opt.value"
          class="px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-colors"
          :class="[
            assignedTo === opt.value
              ? 'border-purple-500 bg-purple-50 text-purple-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
          ]"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- External name (shown when "Extern" is selected) -->
    <div v-if="assignedTo === 'external'">
      <label class="block text-sm font-medium text-gray-700 mb-1">Name / Bezeichnung</label>
      <input
        v-model="externalName"
        type="text"
        placeholder="z.B. Kita, Tagesmutter, Oma, ..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
      />
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
              ? 'bg-purple-500 text-white'
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
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Bis</label>
        <input
          v-model="endTime"
          type="time"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
        />
      </div>
    </div>

    <!-- Recurrence -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Wiederholung</label>
      <select
        v-model="recurrence"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
      >
        <option value="daily">Taeglich</option>
        <option value="weekly">Woechentlich</option>
        <option value="biweekly">Alle 2 Wochen</option>
      </select>
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
        class="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-lg font-medium transition-colors"
        :class="[isValid ? 'hover:bg-purple-600' : 'opacity-50 cursor-not-allowed']"
      >
        Speichern
      </button>
    </div>
  </div>
</template>
