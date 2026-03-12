<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFamily } from '@/composables/useFamily'
import { useAuth } from '@/composables/useAuth'
import {
  isPushSupported,
  isPushSubscribed,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/pushSubscription'

const { familyPub } = useFamily()
const { user } = useAuth()

const supported = ref(false)
const subscribed = ref(false)
const loading = ref(false)
const permissionStatus = ref<NotificationPermission | 'unsupported'>('default')

onMounted(async () => {
  supported.value = isPushSupported()

  if (!supported.value) {
    permissionStatus.value = 'unsupported'
    return
  }

  permissionStatus.value = Notification.permission
  subscribed.value = await isPushSubscribed()
})

async function togglePush(): Promise<void> {
  if (!familyPub.value || !user.value) return

  loading.value = true

  try {
    if (subscribed.value) {
      const success = await unsubscribeFromPush(familyPub.value, user.value.pub)
      if (success) subscribed.value = false
    } else {
      const success = await subscribeToPush(familyPub.value, user.value.pub)
      if (success) {
        subscribed.value = true
        permissionStatus.value = Notification.permission
      } else {
        // Permission might have been denied
        permissionStatus.value = Notification.permission
      }
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm p-4">
    <h3 class="text-lg font-semibold text-gray-800 mb-3">Push-Benachrichtigungen</h3>

    <!-- Not supported -->
    <div v-if="!supported" class="text-sm text-gray-500 flex items-center gap-2">
      <span class="text-xl">&#x1F6AB;</span>
      <span>Push-Benachrichtigungen werden von diesem Browser nicht unterstuetzt.</span>
    </div>

    <!-- Supported -->
    <div v-else class="space-y-3">
      <!-- Toggle -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-800 font-medium">Benachrichtigungen aktivieren</p>
          <p class="text-sm text-gray-500">
            {{ subscribed ? 'Aktiv' : 'Deaktiviert' }}
          </p>
        </div>
        <button
          :disabled="loading || !familyPub"
          @click="togglePush"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          :class="subscribed ? 'bg-blue-500' : 'bg-gray-300'"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="subscribed ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
      </div>

      <!-- Permission status -->
      <div
        v-if="permissionStatus === 'denied'"
        class="text-sm text-red-600 bg-red-50 rounded-md p-3"
      >
        Benachrichtigungen wurden im Browser blockiert. Bitte erlaube Benachrichtigungen in den
        Browser-Einstellungen und versuche es erneut.
      </div>

      <!-- Info about triggers -->
      <div class="text-sm text-gray-500 space-y-1 mt-2">
        <p class="font-medium text-gray-600">Du wirst benachrichtigt bei:</p>
        <ul class="list-disc list-inside space-y-0.5">
          <li>Neuen Tausch-Anfragen</li>
          <li>Aenderungen am Familienplan</li>
          <li>Aktualisierungen von Terminen</li>
        </ul>
      </div>
    </div>
  </div>
</template>
