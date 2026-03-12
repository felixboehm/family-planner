<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFamily } from '@/composables/useFamily'
import { useEvents } from '@/composables/useEvents'
import { useChildren } from '@/composables/useChildren'
import { useCategories } from '@/composables/useCategories'
import { generateICS, downloadICS, type ExportScope } from '@/lib/icalExport'

const { familyId, members } = useFamily()
const { events } = useEvents()
const { children, careSlots } = useChildren()
const { categories } = useCategories()

const copiedUrl = ref<string | null>(null)

const memberList = computed(() => Object.values(members.value))
const childList = computed(() => Object.values(children.value))

const serverBaseUrl = computed(() => {
  const relayUrl = import.meta.env.VITE_GUN_RELAY_URL || 'http://localhost:8765'
  // Convert ws:// to http:// if needed
  return relayUrl.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://').replace(/\/gun$/, '')
})

function buildFeedUrl(scope: ExportScope, filterId?: string): string {
  if (!familyId.value) return ''
  let url = `${serverBaseUrl.value}/ical/${familyId.value}/${scope}?token=${familyId.value}`
  if (filterId) {
    url += `&filterId=${filterId}`
  }
  return url
}

function handleExport(scope: ExportScope, filterId?: string) {
  if (!familyId.value) return

  const ics = generateICS(
    events.value,
    careSlots.value,
    members.value,
    children.value,
    categories.value,
    scope,
    filterId,
    familyId.value,
  )

  let filename = 'family-planner'
  if (scope === 'member' && filterId) {
    const member = members.value[filterId]
    filename = `family-planner-${member?.name ?? 'mitglied'}`
  } else if (scope === 'child' && filterId) {
    const child = children.value[filterId]
    filename = `family-planner-${child?.name ?? 'kind'}`
  }

  downloadICS(ics, `${filename}.ics`)
}

async function copyToClipboard(url: string) {
  try {
    await navigator.clipboard.writeText(url)
    copiedUrl.value = url
    setTimeout(() => {
      copiedUrl.value = null
    }, 2000)
  } catch {
    // Fallback for older browsers
    const input = document.createElement('input')
    input.value = url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    copiedUrl.value = url
    setTimeout(() => {
      copiedUrl.value = null
    }, 2000)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- One-time export section -->
    <div class="bg-white rounded-lg shadow p-4">
      <h3 class="text-lg font-semibold text-gray-800 mb-3">Einmal-Export</h3>
      <p class="text-sm text-gray-500 mb-4">
        Lade eine .ics-Datei herunter und importiere sie in deine Kalender-App.
      </p>

      <!-- Family export -->
      <button
        @click="handleExport('family')"
        class="w-full flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3 hover:bg-blue-100 transition-colors mb-2"
      >
        <div class="flex items-center gap-3">
          <span class="text-xl">&#x1F4C5;</span>
          <span class="text-gray-800 font-medium">Gesamter Familienkalender</span>
        </div>
        <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>

      <!-- Per-member exports -->
      <div v-if="memberList.length > 0" class="mt-3">
        <p class="text-sm text-gray-600 font-medium mb-2">Pro Person:</p>
        <div class="space-y-1">
          <button
            v-for="member in memberList"
            :key="member.id"
            @click="handleExport('member', member.id)"
            class="w-full flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center gap-3">
              <span
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: member.color }"
              ></span>
              <span class="text-gray-700 text-sm">{{ member.name }}</span>
            </div>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Per-child exports -->
      <div v-if="childList.length > 0" class="mt-3">
        <p class="text-sm text-gray-600 font-medium mb-2">Pro Kind:</p>
        <div class="space-y-1">
          <button
            v-for="child in childList"
            :key="child.id"
            @click="handleExport('child', child.id)"
            class="w-full flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center gap-3">
              <span class="text-base">&#x1F9D2;</span>
              <span class="text-gray-700 text-sm">{{ child.name }}</span>
            </div>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Live feed section -->
    <div class="bg-white rounded-lg shadow p-4">
      <h3 class="text-lg font-semibold text-gray-800 mb-3">Live-Feed</h3>
      <p class="text-sm text-gray-500 mb-4">
        Abonniere einen Live-Feed in deiner Kalender-App (Google Calendar, Apple Kalender, Outlook).
        Der Kalender wird automatisch aktualisiert.
      </p>

      <!-- Family feed -->
      <div class="mb-3">
        <label class="text-sm text-gray-600 font-medium">Familien-Feed:</label>
        <div class="flex items-center gap-2 mt-1">
          <input
            type="text"
            readonly
            :value="buildFeedUrl('family')"
            class="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 font-mono truncate"
          />
          <button
            @click="copyToClipboard(buildFeedUrl('family'))"
            class="shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="copiedUrl === buildFeedUrl('family') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'"
          >
            {{ copiedUrl === buildFeedUrl('family') ? 'Kopiert!' : 'Kopieren' }}
          </button>
        </div>
      </div>

      <!-- Per-member feeds -->
      <div v-if="memberList.length > 0" class="space-y-2">
        <div v-for="member in memberList" :key="member.id">
          <label class="text-sm text-gray-600">
            <span
              class="inline-block w-2 h-2 rounded-full mr-1"
              :style="{ backgroundColor: member.color }"
            ></span>
            {{ member.name }}:
          </label>
          <div class="flex items-center gap-2 mt-1">
            <input
              type="text"
              readonly
              :value="buildFeedUrl('member', member.id)"
              class="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 font-mono truncate"
            />
            <button
              @click="copyToClipboard(buildFeedUrl('member', member.id))"
              class="shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="copiedUrl === buildFeedUrl('member', member.id) ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'"
            >
              {{ copiedUrl === buildFeedUrl('member', member.id) ? 'Kopiert!' : 'Kopieren' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Per-child feeds -->
      <div v-if="childList.length > 0" class="space-y-2 mt-3">
        <div v-for="child in childList" :key="child.id">
          <label class="text-sm text-gray-600">
            &#x1F9D2; {{ child.name }}:
          </label>
          <div class="flex items-center gap-2 mt-1">
            <input
              type="text"
              readonly
              :value="buildFeedUrl('child', child.id)"
              class="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 font-mono truncate"
            />
            <button
              @click="copyToClipboard(buildFeedUrl('child', child.id))"
              class="shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="copiedUrl === buildFeedUrl('child', child.id) ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'"
            >
              {{ copiedUrl === buildFeedUrl('child', child.id) ? 'Kopiert!' : 'Kopieren' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Info box -->
      <div class="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p class="text-xs text-amber-800">
          <strong>Hinweis:</strong> Kopiere die Feed-URL und fuege sie in deiner Kalender-App als
          "Kalender-Abo" oder "Per URL abonnieren" hinzu. Die Daten werden automatisch
          synchronisiert. Kompatibel mit Google Calendar, Apple Kalender, Outlook und anderen
          iCal-kompatiblen Apps.
        </p>
      </div>
    </div>
  </div>
</template>
