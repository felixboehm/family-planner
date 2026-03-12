<script setup lang="ts">
import AssistantChat from '@/components/AssistantChat.vue'
</script>

<template>
  <div class="flex flex-col h-full max-w-lg mx-auto">
    <!-- Header -->
    <div class="p-4 pb-0">
      <h2 class="text-2xl font-bold text-gray-800 mb-3">KI-Assistent</h2>

      <!-- Info banner -->
      <div class="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
        <div class="flex items-start gap-2">
          <span class="text-amber-500 mt-0.5">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          <p class="text-sm text-amber-800">
            <strong>Nur Vorschlaege:</strong> Der KI-Assistent gibt Empfehlungen basierend auf
            eurem Familienplan. Alle Aenderungen muesst ihr selbst vornehmen.
          </p>
        </div>
      </div>
    </div>

    <!-- Chat takes remaining height -->
    <div class="flex-1 min-h-0">
      <AssistantChat />
    </div>
  </div>
</template>
