<script setup lang="ts">
import { useRouter } from 'vue-router'
import IcalSettings from '@/components/IcalSettings.vue'
import NotificationSettings from '@/components/NotificationSettings.vue'
import { useTier } from '@/composables/useTier'

const router = useRouter()
const { tier } = useTier()

const tierLabels: Record<string, string> = {
  free: 'Free',
  family: 'Family',
  premium: 'Premium',
}
</script>

<template>
  <div class="p-4 max-w-lg mx-auto">
    <h2 class="text-2xl font-bold text-gray-800 mb-4">Einstellungen</h2>

    <div class="space-y-3">
      <!-- Categories link -->
      <button
        @click="router.push('/categories')"
        class="w-full flex items-center justify-between bg-white rounded-lg shadow-sm px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <span class="text-xl">🏷️</span>
          <span class="text-gray-800 font-medium">Kategorien verwalten</span>
        </div>
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Finance link -->
      <button
        @click="router.push('/finance')"
        class="w-full flex items-center justify-between bg-white rounded-lg shadow-sm px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <span class="text-xl">💰</span>
          <span class="text-gray-800 font-medium">Finanzen</span>
        </div>
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- AI Assistant link -->
      <button
        @click="router.push('/assistant')"
        class="w-full flex items-center justify-between bg-white rounded-lg shadow-sm px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <span class="text-xl">&#x1F916;</span>
          <span class="text-gray-800 font-medium">KI-Assistent</span>
        </div>
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Subscription link -->
      <button
        @click="router.push('/subscription')"
        class="w-full flex items-center justify-between bg-white rounded-lg shadow-sm px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <span class="text-xl">&#x2B50;</span>
          <div class="text-left">
            <span class="text-gray-800 font-medium block">Abo verwalten</span>
            <span class="text-sm text-gray-500">Aktuell: {{ tierLabels[tier] ?? 'Free' }}</span>
          </div>
        </div>
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Push notification settings -->
    <div class="mt-4">
      <NotificationSettings />
    </div>

    <!-- iCal Export & Live Feed -->
    <div class="mt-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span>&#x1F4C5;</span>
        <span>Kalender-Export</span>
      </h3>
      <IcalSettings />
    </div>
  </div>
</template>
