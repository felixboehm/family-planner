<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFamily } from '@/composables/useFamily'

const router = useRouter()
const { createFamily, joinFamily, addMember } = useFamily()

const step = ref(1)
const mode = ref<'create' | 'join' | null>(null)

// Step 1 fields
const familyName = ref('')
const joinId = ref('')

// Step 2 fields
const memberName = ref('')
const memberColor = ref('#3b82f6')

const error = ref('')
const loading = ref(false)

const colorOptions = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

async function handleFamilyStep(): Promise<void> {
  error.value = ''
  loading.value = true

  try {
    if (mode.value === 'create') {
      await createFamily(familyName.value)
    } else if (mode.value === 'join') {
      await joinFamily(joinId.value)
    }
    step.value = 2
  } catch (e: any) {
    error.value = e.message || 'Ein Fehler ist aufgetreten'
  } finally {
    loading.value = false
  }
}

async function handleProfileStep(): Promise<void> {
  error.value = ''
  loading.value = true

  try {
    await addMember(memberName.value, memberColor.value)
    router.push('/')
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
        <h1 class="text-2xl font-bold text-gray-900">Willkommen!</h1>
        <p class="text-gray-500 mt-1">
          {{ step === 1 ? 'Richte deine Familie ein' : 'Erstelle dein Profil' }}
        </p>
      </div>

      <!-- Step indicator -->
      <div class="flex items-center justify-center gap-2 mb-6">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
          :class="step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'"
        >
          1
        </div>
        <div class="w-8 h-0.5" :class="step >= 2 ? 'bg-blue-500' : 'bg-gray-200'"></div>
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
          :class="step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'"
        >
          2
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <!-- Step 1: Family setup -->
        <div v-if="step === 1">
          <!-- Mode selection -->
          <div v-if="mode === null" class="space-y-3">
            <button
              @click="mode = 'create'"
              class="w-full p-4 border-2 border-gray-200 rounded-lg text-left hover:border-blue-500 transition-colors"
            >
              <div class="font-medium text-gray-900">Familie erstellen</div>
              <div class="text-sm text-gray-500 mt-0.5">Starte eine neue Familiengruppe</div>
            </button>
            <button
              @click="mode = 'join'"
              class="w-full p-4 border-2 border-gray-200 rounded-lg text-left hover:border-blue-500 transition-colors"
            >
              <div class="font-medium text-gray-900">Familie beitreten</div>
              <div class="text-sm text-gray-500 mt-0.5">Tritt einer bestehenden Familie bei</div>
            </button>
          </div>

          <!-- Create family form -->
          <form v-else-if="mode === 'create'" @submit.prevent="handleFamilyStep" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Familienname</label>
              <input
                v-model="familyName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. Familie Mueller"
              />
            </div>

            <div v-if="error" class="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
              {{ error }}
            </div>

            <div class="flex gap-2">
              <button
                type="button"
                @click="mode = null"
                class="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Zurueck
              </button>
              <button
                type="submit"
                :disabled="loading || !familyName"
                class="flex-1 bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading ? 'Laden...' : 'Erstellen' }}
              </button>
            </div>
          </form>

          <!-- Join family form -->
          <form v-else-if="mode === 'join'" @submit.prevent="handleFamilyStep" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Familien-ID</label>
              <input
                v-model="joinId"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Familien-ID eingeben"
              />
            </div>

            <div v-if="error" class="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
              {{ error }}
            </div>

            <div class="flex gap-2">
              <button
                type="button"
                @click="mode = null"
                class="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Zurueck
              </button>
              <button
                type="submit"
                :disabled="loading || !joinId"
                class="flex-1 bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading ? 'Laden...' : 'Beitreten' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Step 2: Profile setup -->
        <form v-else-if="step === 2" @submit.prevent="handleProfileStep" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Dein Name</label>
            <input
              v-model="memberName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dein Vorname"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Deine Farbe</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in colorOptions"
                :key="color"
                type="button"
                @click="memberColor = color"
                class="w-10 h-10 rounded-full border-2 transition-transform"
                :class="memberColor === color ? 'border-gray-900 scale-110' : 'border-transparent'"
                :style="{ backgroundColor: color }"
              ></button>
            </div>
          </div>

          <div v-if="error" class="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading || !memberName"
            class="w-full bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Laden...' : 'Fertig' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
