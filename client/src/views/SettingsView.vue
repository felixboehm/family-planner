<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
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
    </div>

    <div class="bg-white rounded-lg shadow p-6 text-center text-gray-500 mt-4">
      <p class="text-4xl mb-3">&#x2699;&#xFE0F;</p>
      <p>Weitere Einstellungen folgen.</p>
    </div>
  </div>
</template>
