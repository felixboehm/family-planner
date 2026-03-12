<script setup lang="ts">
import { computed } from 'vue'
import { useCategories } from '@/composables/useCategories'

const props = defineProps<{
  modelValue: string
  type?: 'need' | 'wish'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { needCategories, wishCategories, categoryList } = useCategories()

const filteredCategories = computed(() => {
  if (props.type === 'need') return needCategories.value
  if (props.type === 'wish') return wishCategories.value
  return categoryList.value
})

const groupedCategories = computed(() => {
  if (props.type) {
    return [{ label: props.type === 'need' ? 'Bedarf' : 'Wunsch', items: filteredCategories.value }]
  }
  const needs = filteredCategories.value.filter((c) => c.type === 'need')
  const wishes = filteredCategories.value.filter((c) => c.type === 'wish')
  const groups = []
  if (needs.length) groups.push({ label: 'Bedarf', items: needs })
  if (wishes.length) groups.push({ label: 'Wunsch', items: wishes })
  return groups
})

function select(id: string) {
  emit('update:modelValue', id)
}
</script>

<template>
  <div class="space-y-3">
    <div v-for="group in groupedCategories" :key="group.label">
      <p class="text-xs font-semibold uppercase tracking-wide mb-1.5" :class="[
        group.label === 'Bedarf' ? 'text-blue-600' : 'text-yellow-600',
      ]">
        {{ group.label === 'Bedarf' ? '🔵' : '🟡' }} {{ group.label }}
      </p>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="cat in group.items"
          :key="cat.id"
          type="button"
          @click="select(cat.id)"
          class="flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-left text-sm transition-colors"
          :class="[
            modelValue === cat.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300',
          ]"
        >
          <span class="text-lg leading-none">{{ cat.emoji }}</span>
          <span class="truncate">{{ cat.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
