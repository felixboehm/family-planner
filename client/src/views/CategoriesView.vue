<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCategories } from '@/composables/useCategories'
import CategoryForm from '@/components/CategoryForm.vue'
import type { Category } from '@/types/family'

const router = useRouter()
const {
  needCategories,
  wishCategories,
  categoryList,
  addCategory,
  updateCategory,
  removeCategory,
  initDefaultCategories,
} = useCategories()

// Seed defaults if none exist yet (e.g. for families created before this feature)
onMounted(() => {
  setTimeout(() => {
    if (categoryList.value.length === 0) {
      initDefaultCategories()
    }
  }, 1000)
})

const showForm = ref(false)
const editingCategory = ref<Category | undefined>(undefined)

function openCreate() {
  editingCategory.value = undefined
  showForm.value = true
}

function openEdit(cat: Category) {
  editingCategory.value = cat
  showForm.value = true
}

function handleSave(data: Omit<Category, 'id' | 'createdAt' | 'isDefault'>) {
  if (editingCategory.value) {
    updateCategory(editingCategory.value.id, data)
  } else {
    addCategory(data)
  }
  showForm.value = false
  editingCategory.value = undefined
}

function handleCancel() {
  showForm.value = false
  editingCategory.value = undefined
}

function handleRemove(id: string) {
  removeCategory(id)
}
</script>

<template>
  <div class="p-4 max-w-lg mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <button
        @click="router.push('/settings')"
        class="text-gray-500 hover:text-gray-700"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 class="text-2xl font-bold text-gray-800">Kategorien</h2>
    </div>

    <!-- Form overlay -->
    <div v-if="showForm" class="bg-white rounded-lg shadow p-4 mb-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-3">
        {{ editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie' }}
      </h3>
      <CategoryForm
        :category="editingCategory"
        @save="handleSave"
        @cancel="handleCancel"
      />
    </div>

    <template v-else>
      <!-- Needs -->
      <div class="mb-6">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-blue-600 mb-2">
          🔵 Bedarf
        </h3>
        <div class="space-y-2">
          <div
            v-for="cat in needCategories"
            :key="cat.id"
            class="flex items-center justify-between bg-white rounded-lg shadow-sm px-4 py-3"
          >
            <div class="flex items-center gap-3">
              <span class="text-xl">{{ cat.emoji }}</span>
              <span class="text-gray-800 font-medium">{{ cat.name }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                v-if="cat.isDefault"
                class="text-gray-400"
                title="Standard-Kategorie"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </span>
              <template v-else>
                <button
                  @click="openEdit(cat)"
                  class="text-gray-400 hover:text-blue-500 transition-colors"
                  title="Bearbeiten"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  @click="handleRemove(cat.id)"
                  class="text-gray-400 hover:text-red-500 transition-colors"
                  title="Loeschen"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Wishes -->
      <div class="mb-6">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-yellow-600 mb-2">
          🟡 Wunsch
        </h3>
        <div class="space-y-2">
          <div
            v-for="cat in wishCategories"
            :key="cat.id"
            class="flex items-center justify-between bg-white rounded-lg shadow-sm px-4 py-3"
          >
            <div class="flex items-center gap-3">
              <span class="text-xl">{{ cat.emoji }}</span>
              <span class="text-gray-800 font-medium">{{ cat.name }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                v-if="cat.isDefault"
                class="text-gray-400"
                title="Standard-Kategorie"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </span>
              <template v-else>
                <button
                  @click="openEdit(cat)"
                  class="text-gray-400 hover:text-blue-500 transition-colors"
                  title="Bearbeiten"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  @click="handleRemove(cat.id)"
                  class="text-gray-400 hover:text-red-500 transition-colors"
                  title="Loeschen"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Add button -->
      <button
        @click="openCreate()"
        class="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors font-medium"
      >
        + Neue Kategorie
      </button>
    </template>
  </div>
</template>
