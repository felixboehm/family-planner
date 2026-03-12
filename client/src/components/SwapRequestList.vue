<script setup lang="ts">
import { computed } from 'vue'
import type { SwapRequest, Member } from '@/types/family'

const props = defineProps<{
  requests: SwapRequest[]
  members: Record<string, Member>
  currentMemberId: string
}>()

const emit = defineEmits<{
  accept: [id: string]
  reject: [id: string]
}>()

function getMemberName(id: string): string {
  return props.members[id]?.name ?? 'Unbekannt'
}

function getMemberColor(id: string): string {
  return props.members[id]?.color ?? '#9ca3af'
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)

  if (diffMin < 1) return 'gerade eben'
  if (diffMin < 60) return `vor ${diffMin} Min.`
  if (diffH < 24) return `vor ${diffH} Std.`
  if (diffD < 7) return `vor ${diffD} Tag${diffD > 1 ? 'en' : ''}`
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}

function isIncoming(req: SwapRequest): boolean {
  return req.toMemberId === props.currentMemberId
}

function statusLabel(status: SwapRequest['status']): string {
  switch (status) {
    case 'accepted': return 'Angenommen'
    case 'rejected': return 'Abgelehnt'
    default: return 'Ausstehend'
  }
}

function statusClass(status: SwapRequest['status']): string {
  switch (status) {
    case 'accepted': return 'bg-green-100 text-green-700'
    case 'rejected': return 'bg-red-100 text-red-700'
    default: return 'bg-yellow-100 text-yellow-700'
  }
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="req in requests"
      :key="req.id"
      class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
    >
      <!-- Header: from member + time -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span
            class="w-3 h-3 rounded-full flex-shrink-0"
            :style="{ backgroundColor: getMemberColor(req.fromMemberId) }"
          ></span>
          <span class="text-sm font-medium text-gray-800">
            {{ isIncoming(req) ? getMemberName(req.fromMemberId) : 'Du' }}
          </span>
          <span class="text-gray-400 text-xs">
            {{ isIncoming(req) ? 'an dich' : `an ${getMemberName(req.toMemberId)}` }}
          </span>
        </div>
        <span class="text-xs text-gray-400">{{ formatTime(req.createdAt) }}</span>
      </div>

      <!-- Message -->
      <p class="text-sm text-gray-700 mb-2">{{ req.message }}</p>

      <!-- Linked event -->
      <div v-if="req.eventId" class="text-xs text-gray-500 mb-3">
        Verknuepfter Termin: {{ req.eventId }}
      </div>

      <!-- Actions / Status -->
      <div v-if="req.status === 'pending'">
        <!-- Incoming: accept / reject -->
        <div v-if="isIncoming(req)" class="flex gap-2">
          <button
            @click="emit('accept', req.id)"
            class="flex-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
          >
            Annehmen
          </button>
          <button
            @click="emit('reject', req.id)"
            class="flex-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Ablehnen
          </button>
        </div>
        <!-- Outgoing: waiting label -->
        <div v-else class="text-sm text-yellow-600 font-medium">
          Warten auf Antwort...
        </div>
      </div>

      <!-- Resolved status badge -->
      <div v-else>
        <span
          class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="statusClass(req.status)"
        >
          {{ statusLabel(req.status) }}
        </span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="requests.length === 0" class="text-center py-12 text-gray-400">
      <p class="text-4xl mb-2">📭</p>
      <p class="text-sm">Keine Anfragen</p>
    </div>
  </div>
</template>
