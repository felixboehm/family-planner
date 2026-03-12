<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Member, FamilyEvent } from '@/types/family'

const props = defineProps<{
  members: Record<string, Member>
  events?: FamilyEvent[]
  currentMemberId: string
  prefillToMemberId?: string
  prefillEventId?: string
}>()

const emit = defineEmits<{
  send: [data: { toMemberId: string; eventId?: string; message: string }]
  cancel: []
}>()

const toMemberId = ref(props.prefillToMemberId ?? '')
const eventId = ref(props.prefillEventId ?? '')
const message = ref('')

const otherMembers = computed(() =>
  Object.values(props.members).filter((m) => m.id !== props.currentMemberId),
)

const availableEvents = computed(() => {
  if (!props.events) return []
  return props.events
})

const canSend = computed(() => toMemberId.value !== '' && message.value.trim() !== '')

function handleSend() {
  if (!canSend.value) return
  emit('send', {
    toMemberId: toMemberId.value,
    eventId: eventId.value || undefined,
    message: message.value.trim(),
  })
}
</script>

<template>
  <form @submit.prevent="handleSend" class="space-y-4">
    <!-- To member -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">An</label>
      <select
        v-model="toMemberId"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="" disabled>Familienmitglied auswaehlen...</option>
        <option v-for="member in otherMembers" :key="member.id" :value="member.id">
          {{ member.name }}
        </option>
      </select>
    </div>

    <!-- Event / Slot reference -->
    <div v-if="availableEvents.length > 0">
      <label class="block text-sm font-medium text-gray-700 mb-1">Termin (optional)</label>
      <select
        v-model="eventId"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Kein Termin verknuepft</option>
        <option v-for="evt in availableEvents" :key="evt.id" :value="evt.id">
          {{ evt.title }} ({{ evt.startTime }}-{{ evt.endTime }})
        </option>
      </select>
    </div>

    <!-- Message -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Nachricht</label>
      <textarea
        v-model="message"
        rows="3"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        placeholder="z.B. Kannst du Mi Nachmittag uebernehmen?"
      ></textarea>
    </div>

    <!-- Buttons -->
    <div class="flex gap-3 pt-2">
      <button
        type="button"
        @click="emit('cancel')"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Abbrechen
      </button>
      <button
        type="submit"
        :disabled="!canSend"
        class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Senden
      </button>
    </div>
  </form>
</template>
