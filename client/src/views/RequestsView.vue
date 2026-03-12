<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SwapRequest } from '@/types/family'
import { useFamily } from '@/composables/useFamily'
import { useRequests } from '@/composables/useRequests'
import { useEvents } from '@/composables/useEvents'
import SwapRequestForm from '@/components/SwapRequestForm.vue'
import SwapRequestList from '@/components/SwapRequestList.vue'
import gun from '@/lib/gun'

const { members } = useFamily()
const { requestList, createRequest, acceptRequest, rejectRequest } = useRequests()
const { eventList } = useEvents()

// Current user's memberId
const currentMemberId = ref<string>('')
gun.user().get('memberId').on((data: any) => {
  if (data && typeof data === 'string') {
    currentMemberId.value = data
  }
})

// Tabs
type Tab = 'incoming' | 'outgoing' | 'all'
const activeTab = ref<Tab>('incoming')

const filteredRequests = computed<SwapRequest[]>(() => {
  if (activeTab.value === 'incoming') {
    return requestList.value.filter((r) => r.toMemberId === currentMemberId.value)
  }
  if (activeTab.value === 'outgoing') {
    return requestList.value.filter((r) => r.fromMemberId === currentMemberId.value)
  }
  return requestList.value
})

// Modal
const showForm = ref(false)

function handleSend(data: { toMemberId: string; eventId?: string; message: string }) {
  createRequest({
    fromMemberId: currentMemberId.value,
    toMemberId: data.toMemberId,
    eventId: data.eventId,
    message: data.message,
  })
  showForm.value = false
}

function handleAccept(id: string) {
  acceptRequest(id)
}

function handleReject(id: string) {
  rejectRequest(id)
}

const tabs: { key: Tab; label: string }[] = [
  { key: 'incoming', label: 'Eingehend' },
  { key: 'outgoing', label: 'Ausgehend' },
  { key: 'all', label: 'Alle' },
]
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="px-4 pt-4 pb-2">
      <h2 class="text-2xl font-bold text-gray-800 mb-3">Anfragen</h2>

      <!-- Tabs -->
      <div class="flex bg-gray-100 rounded-lg p-1 mb-3">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          :class="[
            activeTab === tab.key
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Request list -->
    <div class="flex-1 overflow-y-auto px-4 pb-24">
      <SwapRequestList
        :requests="filteredRequests"
        :members="members"
        :current-member-id="currentMemberId"
        @accept="handleAccept"
        @reject="handleReject"
      />
    </div>

    <!-- Floating add button -->
    <button
      @click="showForm = true"
      class="fixed bottom-20 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-blue-600 active:scale-95 transition-all z-20"
    >
      +
    </button>

    <!-- Modal -->
    <Teleport to="body">
      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      >
        <div
          class="absolute inset-0 bg-black/40"
          @click="showForm = false"
        ></div>
        <div class="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto p-5 z-10">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Neue Anfrage</h3>
          <SwapRequestForm
            :members="members"
            :events="eventList"
            :current-member-id="currentMemberId"
            @send="handleSend"
            @cancel="showForm = false"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
