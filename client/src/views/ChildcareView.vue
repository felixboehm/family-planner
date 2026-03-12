<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Child, CareSlot } from '@/types/family'
import { useFamily } from '@/composables/useFamily'
import { useChildren } from '@/composables/useChildren'
import { findCareGaps, type CareBlock } from '@/lib/gapDetection'
import ChildProfile from '@/components/ChildProfile.vue'
import CareSlotForm from '@/components/CareSlotForm.vue'

const { members } = useFamily()
const {
  childList,
  careSlots,
  careSlotsForChild,
  addChild,
  updateChild,
  removeChild,
  addCareSlot,
  updateCareSlot,
  removeCareSlot,
} = useChildren()

// ---- Child form state ----
const showChildForm = ref(false)
const editingChild = ref<Child | null>(null)
const childName = ref('')
const childBirthDate = ref('')

function openAddChild() {
  editingChild.value = null
  childName.value = ''
  childBirthDate.value = ''
  showChildForm.value = true
}

function openEditChild(child: Child) {
  editingChild.value = child
  childName.value = child.name
  childBirthDate.value = child.birthDate
  showChildForm.value = true
}

function saveChild() {
  if (!childName.value.trim()) return
  if (editingChild.value) {
    updateChild(editingChild.value.id, {
      name: childName.value.trim(),
      birthDate: childBirthDate.value,
    })
  } else {
    addChild(childName.value.trim(), childBirthDate.value)
  }
  showChildForm.value = false
}

function confirmRemoveChild(childId: string) {
  const child = childList.value.find((c) => c.id === childId)
  if (child && confirm(`"${child.name}" wirklich entfernen?`)) {
    removeChild(childId)
  }
}

// ---- Expanded children ----
const expandedChildIds = ref<Set<string>>(new Set())

function toggleExpand(childId: string) {
  const next = new Set(expandedChildIds.value)
  if (next.has(childId)) {
    next.delete(childId)
  } else {
    next.add(childId)
  }
  expandedChildIds.value = next
}

// ---- Care slot form state ----
const showSlotForm = ref(false)
const editingSlot = ref<CareSlot | undefined>(undefined)
const slotChildId = ref('')

function openAddSlot(childId: string) {
  editingSlot.value = undefined
  slotChildId.value = childId
  showSlotForm.value = true
}

function openEditSlot(slot: CareSlot) {
  editingSlot.value = slot
  slotChildId.value = slot.childId
  showSlotForm.value = true
}

function handleSaveSlot(data: Omit<CareSlot, 'id' | 'createdAt'>) {
  if (editingSlot.value) {
    updateCareSlot(editingSlot.value.id, data)
  } else {
    addCareSlot(data)
  }
  showSlotForm.value = false
  editingSlot.value = undefined
}

function confirmRemoveSlot(slot: CareSlot) {
  if (confirm('Betreuungsslot wirklich entfernen?')) {
    removeCareSlot(slot.id)
  }
}

// ---- Helper functions ----
const dayLabels: Record<number, string> = {
  1: 'Mo', 2: 'Di', 3: 'Mi', 4: 'Do', 5: 'Fr', 6: 'Sa', 0: 'So',
}
const weekdays = [1, 2, 3, 4, 5, 6, 0]

function assignedLabel(slot: CareSlot): string {
  if (slot.assignedTo === 'both') return 'Beide'
  if (slot.assignedTo === 'external') return slot.externalName ?? 'Extern'
  return members.value[slot.assignedTo]?.name ?? slot.assignedTo
}

function assignedColor(slot: CareSlot): string {
  if (slot.assignedTo === 'both') return '#8b5cf6'
  if (slot.assignedTo === 'external') return '#f59e0b'
  return members.value[slot.assignedTo]?.color ?? '#6b7280'
}

function recurrenceLabel(r: string): string {
  switch (r) {
    case 'daily': return 'Taeglich'
    case 'weekly': return 'Woechentlich'
    case 'biweekly': return 'Alle 2 Wochen'
    default: return r
  }
}

// ---- Gap detection per child per day ----
function gapsForChild(childId: string, childName: string) {
  return computed(() => {
    const slots = Object.values(careSlots.value).filter((s) => s.childId === childId)
    const allGaps: ReturnType<typeof findCareGaps> = []

    for (const day of weekdays) {
      const dayBlocks: CareBlock[] = slots
        .filter((s) => s.days.includes(day))
        .map((s) => ({
          childId: s.childId,
          startTime: s.startTime,
          endTime: s.endTime,
          assignedTo: s.assignedTo,
        }))

      const dayGaps = findCareGaps(dayBlocks, '07:00', '20:00', childId, childName, day)
      allGaps.push(...dayGaps)
    }

    return allGaps
  })
}

// ---- Weekly overview helpers ----
function slotsForChildDay(childId: string, day: number) {
  return Object.values(careSlots.value)
    .filter((s) => s.childId === childId && s.days.includes(day))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

function timeToPercent(time: string): number {
  const [h, m] = time.split(':').map(Number)
  const minutes = h * 60 + m
  // Scale 07:00 (420) - 20:00 (1200) to 0-100%
  return ((minutes - 420) / (1200 - 420)) * 100
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="px-4 pt-4 pb-2">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-gray-800">Betreuungsplanung</h2>
        <button
          @click="openAddChild()"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
        >
          <span class="text-lg leading-none">+</span>
          Kind hinzufuegen
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-4 pb-24 space-y-4">
      <!-- Empty state -->
      <div v-if="childList.length === 0" class="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        <p class="text-4xl mb-3">&#x1F476;</p>
        <p>Noch keine Kinder hinzugefuegt.</p>
        <p class="text-sm mt-1">Klicke auf "Kind hinzufuegen" um zu beginnen.</p>
      </div>

      <!-- Child list -->
      <ChildProfile
        v-for="child in childList"
        :key="child.id"
        :child="child"
        :expanded="expandedChildIds.has(child.id)"
        @edit="openEditChild"
        @remove="confirmRemoveChild"
        @toggle="toggleExpand(child.id)"
      >
        <div class="p-4 space-y-4">
          <!-- Care slots list -->
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Betreuungszeiten</h4>
            <button
              @click="openAddSlot(child.id)"
              class="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-600 rounded-md text-xs font-medium hover:bg-purple-100 transition-colors"
            >
              + Betreuung hinzufuegen
            </button>
          </div>

          <div v-if="careSlotsForChild(child.id).value.length === 0" class="text-sm text-gray-400 italic">
            Keine Betreuungszeiten eingerichtet.
          </div>

          <div
            v-for="s in careSlotsForChild(child.id).value"
            :key="s.id"
            class="flex items-center justify-between bg-gray-50 rounded-lg p-3 group"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-1 h-10 rounded-full"
                :style="{ backgroundColor: assignedColor(s) }"
              ></div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-800 text-sm">{{ assignedLabel(s) }}</span>
                  <span class="text-xs text-gray-400">{{ recurrenceLabel(s.recurrence) }}</span>
                </div>
                <div class="text-xs text-gray-500">
                  {{ s.startTime }} - {{ s.endTime }}
                  <span class="ml-1.5">
                    {{ s.days.map(d => dayLabels[d]).join(', ') }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click="openEditSlot(s)"
                class="p-1.5 text-gray-400 hover:text-blue-500 rounded hover:bg-blue-50"
                title="Bearbeiten"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                @click="confirmRemoveSlot(s)"
                class="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
                title="Entfernen"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Weekly visual timeline -->
          <div v-if="careSlotsForChild(child.id).value.length > 0" class="mt-4">
            <h4 class="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Wochenuebersicht</h4>
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <!-- Time axis -->
              <div class="flex border-b border-gray-100">
                <div class="w-10 flex-shrink-0"></div>
                <div class="flex-1 flex justify-between px-1 py-1">
                  <span class="text-[10px] text-gray-400">07:00</span>
                  <span class="text-[10px] text-gray-400">10:00</span>
                  <span class="text-[10px] text-gray-400">13:00</span>
                  <span class="text-[10px] text-gray-400">16:00</span>
                  <span class="text-[10px] text-gray-400">20:00</span>
                </div>
              </div>

              <!-- Day rows -->
              <div
                v-for="day in weekdays"
                :key="day"
                class="flex items-center border-b border-gray-50 last:border-b-0"
              >
                <div class="w-10 flex-shrink-0 text-xs text-gray-500 font-medium text-center py-2">
                  {{ dayLabels[day] }}
                </div>
                <div class="flex-1 relative h-7 bg-gray-50">
                  <!-- Care slot bars -->
                  <div
                    v-for="s in slotsForChildDay(child.id, day)"
                    :key="s.id"
                    class="absolute top-0.5 bottom-0.5 rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                    :style="{
                      left: Math.max(0, timeToPercent(s.startTime)) + '%',
                      width: Math.min(100, timeToPercent(s.endTime)) - Math.max(0, timeToPercent(s.startTime)) + '%',
                      backgroundColor: assignedColor(s) + 'cc',
                    }"
                    :title="`${assignedLabel(s)}: ${s.startTime} - ${s.endTime}`"
                    @click="openEditSlot(s)"
                  >
                    <span class="text-[9px] text-white font-medium px-1 truncate block leading-6">
                      {{ assignedLabel(s) }}
                    </span>
                  </div>

                  <!-- Gap indicators -->
                  <div
                    v-for="(gap, gi) in findCareGaps(
                      slotsForChildDay(child.id, day).map(s => ({
                        childId: s.childId,
                        startTime: s.startTime,
                        endTime: s.endTime,
                        assignedTo: s.assignedTo,
                      })),
                      '07:00', '20:00', child.id, child.name, day
                    )"
                    :key="`gap-${gi}`"
                    class="absolute top-0.5 bottom-0.5 rounded-sm bg-red-200/60 border border-red-300 border-dashed"
                    :style="{
                      left: Math.max(0, timeToPercent(gap.startTime)) + '%',
                      width: Math.min(100, timeToPercent(gap.endTime)) - Math.max(0, timeToPercent(gap.startTime)) + '%',
                    }"
                    :title="`Luecke: ${gap.startTime} - ${gap.endTime}`"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Gap warnings -->
          <div v-if="gapsForChild(child.id, child.name).value.length > 0" class="mt-3">
            <div class="bg-red-50 border border-red-200 rounded-lg p-3">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span class="text-sm font-medium text-red-700">Betreuungsluecken</span>
              </div>
              <ul class="space-y-1">
                <li
                  v-for="(gap, gi) in gapsForChild(child.id, child.name).value"
                  :key="gi"
                  class="text-xs text-red-600"
                >
                  {{ dayLabels[gap.day] }}: {{ gap.startTime }} - {{ gap.endTime }} nicht abgedeckt
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ChildProfile>
    </div>

    <!-- Child form modal -->
    <Teleport to="body">
      <div
        v-if="showChildForm"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      >
        <div class="absolute inset-0 bg-black/40" @click="showChildForm = false"></div>
        <div class="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 z-10">
          <h3 class="text-lg font-bold text-gray-800 mb-4">
            {{ editingChild ? 'Kind bearbeiten' : 'Kind hinzufuegen' }}
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                v-model="childName"
                type="text"
                placeholder="z.B. Emma, Leon, ..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Geburtsdatum</label>
              <input
                v-model="childBirthDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>
            <div class="flex gap-3 pt-2">
              <button
                @click="showChildForm = false"
                class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                @click="saveChild"
                :disabled="!childName.trim()"
                class="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-lg font-medium transition-colors"
                :class="[childName.trim() ? 'hover:bg-purple-600' : 'opacity-50 cursor-not-allowed']"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Care slot form modal -->
    <Teleport to="body">
      <div
        v-if="showSlotForm"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      >
        <div class="absolute inset-0 bg-black/40" @click="showSlotForm = false"></div>
        <div class="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto p-5 z-10">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">
              {{ editingSlot ? 'Betreuung bearbeiten' : 'Betreuung hinzufuegen' }}
            </h3>
            <button
              v-if="editingSlot"
              @click="confirmRemoveSlot(editingSlot!); showSlotForm = false"
              class="text-red-500 text-sm font-medium hover:text-red-600"
            >
              Loeschen
            </button>
          </div>
          <CareSlotForm
            :slot="editingSlot"
            :child-id="slotChildId"
            :members="members"
            @save="handleSaveSlot"
            @cancel="showSlotForm = false"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
