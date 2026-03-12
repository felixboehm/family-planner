<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { signIn, signUp } = useAuth()

const activeTab = ref<'login' | 'register'>('login')
const alias = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit(): Promise<void> {
  error.value = ''
  loading.value = true

  try {
    if (activeTab.value === 'register') {
      await signUp(alias.value, password.value)
    } else {
      await signIn(alias.value, password.value)
    }
    router.push('/onboarding')
  } catch (e: any) {
    error.value = e.message || 'Ein Fehler ist aufgetreten'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Family-Planner</h1>
        <p class="text-gray-500 mt-1">Gemeinsam planen, fair teilen</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <!-- Tabs -->
        <div class="flex border-b border-gray-200">
          <button
            @click="activeTab = 'login'"
            class="flex-1 py-3 text-sm font-medium transition-colors"
            :class="
              activeTab === 'login'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            "
          >
            Anmelden
          </button>
          <button
            @click="activeTab = 'register'"
            class="flex-1 py-3 text-sm font-medium transition-colors"
            :class="
              activeTab === 'register'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            "
          >
            Registrieren
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div>
            <label for="alias" class="block text-sm font-medium text-gray-700 mb-1">
              Benutzername
            </label>
            <input
              id="alias"
              v-model="alias"
              type="text"
              required
              autocomplete="username"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dein Benutzername"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Passwort
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dein Passwort"
            />
          </div>

          <div v-if="error" class="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading || !alias || !password"
            class="w-full bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Laden...</span>
            <span v-else>
              {{ activeTab === 'login' ? 'Anmelden' : 'Registrieren' }}
            </span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
