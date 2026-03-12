<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    max: number
    color: string
    unit?: string
  }>(),
  {
    unit: 'h',
  },
)

const fillPercent = computed(() => {
  if (props.max <= 0) return 0
  return Math.min(100, Math.round((props.value / props.max) * 100))
})
</script>

<template>
  <div class="flex items-center gap-3 w-full">
    <span class="text-sm text-gray-600 w-36 shrink-0 truncate">{{ label }}</span>
    <div class="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
      <div
        class="h-full rounded-full transition-all duration-500 ease-out"
        :style="{ width: fillPercent + '%', backgroundColor: color }"
      />
    </div>
    <span class="text-sm font-medium text-gray-700 w-14 text-right shrink-0">
      {{ value }}{{ unit }}
    </span>
  </div>
</template>
