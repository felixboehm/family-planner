<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import gun from '@/lib/gun'
import type { Member } from '@/types/family'

interface Comment {
  id: string
  memberId: string
  text: string
  createdAt: number
}

const props = defineProps<{
  entityId: string
  familyId: string
  currentMemberId: string
  members: Record<string, Member>
}>()

const comments = ref<Record<string, Comment>>({})
const newText = ref('')

const commentList = computed(() =>
  Object.values(comments.value).sort((a, b) => a.createdAt - b.createdAt),
)

// Subscribe to comments for this entity
watch(
  () => props.entityId,
  (entityId) => {
    comments.value = {}
    if (!entityId || !props.familyId) return

    gun
      .get('families')
      .get(props.familyId)
      .get('comments')
      .get(entityId)
      .map()
      .on((data: any, key: string) => {
        if (data === null || data === undefined) {
          const updated = { ...comments.value }
          delete updated[key]
          comments.value = updated
          return
        }
        if (typeof data === 'object') {
          comments.value = {
            ...comments.value,
            [key]: {
              id: key,
              memberId: data.memberId ?? '',
              text: data.text ?? '',
              createdAt: data.createdAt ?? 0,
            },
          }
        }
      })
  },
  { immediate: true },
)

function getMemberName(id: string): string {
  return props.members[id]?.name ?? 'Unbekannt'
}

function getMemberColor(id: string): string {
  return props.members[id]?.color ?? '#9ca3af'
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function sendComment() {
  const text = newText.value.trim()
  if (!text || !props.familyId || !props.entityId) return

  const id = `cmt-${crypto.randomUUID()}`
  const now = Date.now()

  gun
    .get('families')
    .get(props.familyId)
    .get('comments')
    .get(props.entityId)
    .get(id)
    .put({
      memberId: props.currentMemberId,
      text,
      createdAt: now,
    } as any)

  newText.value = ''
}
</script>

<template>
  <div class="flex flex-col">
    <h4 class="text-sm font-semibold text-gray-700 mb-2">Kommentare</h4>

    <!-- Comment list -->
    <div class="space-y-2 mb-3 max-h-48 overflow-y-auto">
      <div
        v-for="comment in commentList"
        :key="comment.id"
        class="flex items-start gap-2"
      >
        <span
          class="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
          :style="{ backgroundColor: getMemberColor(comment.memberId) }"
        ></span>
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-2">
            <span class="text-xs font-medium text-gray-800">{{ getMemberName(comment.memberId) }}</span>
            <span class="text-xs text-gray-400">{{ formatTime(comment.createdAt) }}</span>
          </div>
          <p class="text-sm text-gray-700 break-words">{{ comment.text }}</p>
        </div>
      </div>
      <div v-if="commentList.length === 0" class="text-xs text-gray-400 py-2">
        Noch keine Kommentare.
      </div>
    </div>

    <!-- Input -->
    <div class="flex gap-2">
      <input
        v-model="newText"
        @keydown.enter.prevent="sendComment"
        type="text"
        placeholder="Kommentar schreiben..."
        class="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        @click="sendComment"
        :disabled="!newText.trim()"
        class="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Senden
      </button>
    </div>
  </div>
</template>
