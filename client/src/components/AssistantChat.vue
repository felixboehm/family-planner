<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useAssistant } from '@/composables/useAssistant'

const { messages, isLoading, sendMessage, clearMessages, quickSuggestions } = useAssistant()

const inputText = ref('')
const chatContainer = ref<HTMLElement | null>(null)

async function handleSend(): Promise<void> {
  if (!inputText.value.trim() || isLoading.value) return
  const text = inputText.value
  inputText.value = ''
  await sendMessage(text)
}

async function handleSuggestion(suggestion: string): Promise<void> {
  if (isLoading.value) return
  await sendMessage(suggestion)
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

// Auto-scroll on new messages
watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  },
)
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Chat messages area -->
    <div
      ref="chatContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4"
    >
      <!-- Empty state -->
      <div
        v-if="messages.length === 0 && !isLoading"
        class="flex flex-col items-center justify-center h-full text-center px-4"
      >
        <div class="text-5xl mb-4">&#x1F916;</div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">KI-Familienassistent</h3>
        <p class="text-gray-500 text-sm mb-6 max-w-sm">
          Stelle Fragen zu eurem Familienplan, zur Fairness-Verteilung oder lass dir
          Verbesserungsvorschlaege geben.
        </p>

        <!-- Quick suggestions -->
        <div class="flex flex-wrap gap-2 justify-center max-w-md">
          <button
            v-for="suggestion in quickSuggestions"
            :key="suggestion"
            @click="handleSuggestion(suggestion)"
            class="text-sm bg-blue-50 text-blue-700 rounded-full px-4 py-2 hover:bg-blue-100 transition-colors border border-blue-200"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <!-- Message bubbles -->
      <template v-for="msg in messages" :key="msg.timestamp">
        <!-- User message -->
        <div v-if="msg.role === 'user'" class="flex justify-end">
          <div class="max-w-[80%]">
            <div class="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-2.5">
              <p class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
            </div>
            <p class="text-xs text-gray-400 text-right mt-1">{{ formatTime(msg.timestamp) }}</p>
          </div>
        </div>

        <!-- Assistant message -->
        <div v-else class="flex justify-start">
          <div class="max-w-[80%]">
            <div class="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md px-4 py-2.5">
              <p class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
            </div>
            <p class="text-xs text-gray-400 mt-1">{{ formatTime(msg.timestamp) }}</p>
          </div>
        </div>
      </template>

      <!-- Loading indicator -->
      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
          <div class="flex space-x-1.5">
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick suggestions (when chat has messages) -->
    <div
      v-if="messages.length > 0 && !isLoading"
      class="px-4 pb-2 flex gap-2 overflow-x-auto"
    >
      <button
        v-for="suggestion in quickSuggestions"
        :key="suggestion"
        @click="handleSuggestion(suggestion)"
        class="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1.5 hover:bg-gray-200 transition-colors whitespace-nowrap shrink-0"
      >
        {{ suggestion }}
      </button>
    </div>

    <!-- Input area -->
    <div class="border-t border-gray-200 p-4 bg-white">
      <div class="flex items-end gap-2">
        <textarea
          v-model="inputText"
          @keydown="handleKeydown"
          :disabled="isLoading"
          placeholder="Stelle eine Frage..."
          rows="1"
          class="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
        ></textarea>
        <button
          @click="handleSend"
          :disabled="!inputText.trim() || isLoading"
          class="shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V5m0 0l-7 7m7-7l7 7" />
          </svg>
        </button>
      </div>
      <div class="flex justify-between items-center mt-2">
        <p class="text-xs text-gray-400">Enter zum Senden, Shift+Enter fuer neue Zeile</p>
        <button
          v-if="messages.length > 0"
          @click="clearMessages"
          class="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Chat leeren
        </button>
      </div>
    </div>
  </div>
</template>
