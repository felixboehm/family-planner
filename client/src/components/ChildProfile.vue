<script setup lang="ts">
import { computed } from 'vue'
import type { Child } from '@/types/family'

const props = defineProps<{
  child: Child
  expanded: boolean
}>()

const emit = defineEmits<{
  edit: [child: Child]
  remove: [childId: string]
  toggle: []
}>()

const age = computed(() => {
  if (!props.child.birthDate) return ''
  const birth = new Date(props.child.birthDate)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    years--
  }
  if (years < 1) {
    // Show months for babies
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    if (now.getDate() < birth.getDate()) months--
    return `${Math.max(0, months)} Monate`
  }
  return `${years} ${years === 1 ? 'Jahr' : 'Jahre'}`
})
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
    <!-- Header -->
    <div
      class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      @click="emit('toggle')"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-lg">
          &#x1F476;
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">{{ child.name }}</h3>
          <p class="text-sm text-gray-500" v-if="age">{{ age }} alt</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click.stop="emit('edit', child)"
          class="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
          title="Bearbeiten"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          @click.stop="emit('remove', child.id)"
          class="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          title="Entfernen"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <svg
          class="w-5 h-5 text-gray-400 transition-transform"
          :class="{ 'rotate-180': expanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- Expanded slot content -->
    <div v-if="expanded" class="border-t border-gray-100">
      <slot />
    </div>
  </div>
</template>
