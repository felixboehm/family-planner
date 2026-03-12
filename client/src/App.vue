<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useFamily } from '@/composables/useFamily'

const router = useRouter()
const { isAuthenticated, isLoading } = useAuth()
const { familyId } = useFamily()

const showNavigation = computed(() => isAuthenticated.value && familyId.value !== null)

const navItems = [
  { label: 'Kalender', icon: '\u{1F4C5}', path: '/' },
  { label: 'Betreuung', icon: '\u{1F9D1}\u200D\u{1F37C}', path: '/childcare' },
  { label: 'Fairness', icon: '\u2696\uFE0F', path: '/fairness' },
  { label: 'Mehr', icon: '\u2699\uFE0F', path: '/settings' },
]
</script>

<template>
  <!-- Loading state -->
  <div v-if="isLoading" class="flex items-center justify-center h-screen bg-gray-50">
    <div class="text-center">
      <div
        class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"
      ></div>
      <p class="text-gray-500 text-sm mt-3">Laden...</p>
    </div>
  </div>

  <div v-else class="flex flex-col h-screen bg-gray-50">
    <!-- Header -->
    <header
      v-if="showNavigation"
      class="bg-blue-500 text-white px-4 py-3 shadow-md flex-shrink-0"
    >
      <h1 class="text-lg font-semibold text-center">Family-Planner</h1>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <router-view />
    </main>

    <!-- Bottom Navigation -->
    <nav
      v-if="showNavigation"
      class="bg-white border-t border-gray-200 flex-shrink-0 safe-area-bottom"
    >
      <div class="flex justify-around">
        <button
          v-for="item in navItems"
          :key="item.path"
          @click="router.push(item.path)"
          class="flex flex-col items-center py-2 px-3 min-w-0 flex-1 transition-colors"
          :class="[
            router.currentRoute.value.path === item.path
              ? 'text-blue-500'
              : 'text-gray-500 hover:text-gray-700',
          ]"
        >
          <span class="text-xl leading-none">{{ item.icon }}</span>
          <span class="text-xs mt-1 truncate">{{ item.label }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
