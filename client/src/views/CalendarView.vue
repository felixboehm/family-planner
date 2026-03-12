<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FamilyEvent } from '@/types/family'
import { useFamily } from '@/composables/useFamily'
import { useEvents } from '@/composables/useEvents'
import { useCategories } from '@/composables/useCategories'
import WeekCalendar from '@/components/WeekCalendar.vue'
import EventForm from '@/components/EventForm.vue'
import gun from '@/lib/gun'

const { members, familyId } = useFamily()
const { events, eventList, addEvent, updateEvent, removeEvent } = useEvents()
const { categories } = useCategories()

// Current user's memberId (stored in user space)
const currentMemberId = ref<string>('')
gun.user().get('memberId').on((data: any) => {
  if (data && typeof data === 'string') {
    currentMemberId.value = data
  }
})

// View mode
type ViewMode = 'personal' | 'family'
const viewMode = ref<ViewMode>('personal')

// Member filter for family view
const activeMemberIds = ref<Set<string>>(new Set())

// Initialize filter with all members
const membersReady = computed(() => Object.keys(members.value))
// Keep filter in sync when members change
watch(membersReady, (ids) => {
  if (activeMemberIds.value.size === 0 && ids.length > 0) {
    activeMemberIds.value = new Set(ids)
  }
}, { immediate: true })

function toggleMemberFilter(id: string) {
  const next = new Set(activeMemberIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  activeMemberIds.value = next
}

// Filtered events based on view mode
const filteredEvents = computed(() => {
  if (viewMode.value === 'personal') {
    return eventList.value.filter((e) => e.memberId === currentMemberId.value)
  }
  // Family view with member filter
  return eventList.value.filter((e) => activeMemberIds.value.has(e.memberId))
})

// Modal state
const showForm = ref(false)
const editingEvent = ref<FamilyEvent | undefined>(undefined)
const prefillDay = ref<number | undefined>(undefined)
const prefillTime = ref<string | undefined>(undefined)

function openCreateForm(day?: number, time?: string) {
  editingEvent.value = undefined
  prefillDay.value = day
  prefillTime.value = time
  showForm.value = true
}

function openEditForm(event: FamilyEvent) {
  editingEvent.value = event
  showForm.value = true
}

function handleSave(data: Omit<FamilyEvent, 'id' | 'createdAt'>) {
  if (editingEvent.value) {
    updateEvent(editingEvent.value.id, data)
  } else {
    addEvent(data)
  }
  showForm.value = false
  editingEvent.value = undefined
}

function handleDelete() {
  if (editingEvent.value) {
    removeEvent(editingEvent.value.id)
    showForm.value = false
    editingEvent.value = undefined
  }
}

function handleCancel() {
  showForm.value = false
  editingEvent.value = undefined
}

// Build a prefilled event for the form when creating from a slot click
const formEvent = computed<FamilyEvent | undefined>(() => {
  if (editingEvent.value) return editingEvent.value
  if (prefillDay.value !== undefined || prefillTime.value) {
    return {
      id: '',
      memberId: currentMemberId.value,
      title: '',
      categoryId: '',
      type: 'need',
      days: prefillDay.value !== undefined ? [prefillDay.value] : [],
      startTime: prefillTime.value ?? '08:00',
      endTime: prefillTime.value
        ? `${(parseInt(prefillTime.value.split(':')[0]) + 1).toString().padStart(2, '0')}:00`
        : '09:00',
      recurrence: 'weekly',
      createdAt: 0,
    }
  }
  return undefined
})
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="px-4 pt-4 pb-2">
      <h2 class="text-2xl font-bold text-gray-800 mb-3">Familienkalender</h2>

      <!-- View mode tabs -->
      <div class="flex bg-gray-100 rounded-lg p-1 mb-3">
        <button
          @click="viewMode = 'personal'"
          class="flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          :class="[
            viewMode === 'personal'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800',
          ]"
        >
          Mein Plan
        </button>
        <button
          @click="viewMode = 'family'"
          class="flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          :class="[
            viewMode === 'family'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800',
          ]"
        >
          Familienplan
        </button>
      </div>

      <!-- Member filter chips (family view only) -->
      <div v-if="viewMode === 'family'" class="flex flex-wrap gap-2 mb-2">
        <button
          v-for="member in Object.values(members)"
          :key="member.id"
          @click="toggleMemberFilter(member.id)"
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border-2 transition-colors"
          :class="[
            activeMemberIds.has(member.id)
              ? 'border-current text-white'
              : 'border-gray-200 text-gray-400 bg-white',
          ]"
          :style="
            activeMemberIds.has(member.id)
              ? { backgroundColor: member.color, borderColor: member.color }
              : {}
          "
        >
          <span
            class="w-2.5 h-2.5 rounded-full"
            :style="{ backgroundColor: member.color }"
          ></span>
          {{ member.name }}
        </button>
      </div>
    </div>

    <!-- Calendar -->
    <div class="flex-1 overflow-y-auto px-2">
      <WeekCalendar
        :events="filteredEvents"
        :members="members"
        :categories="categories"
        @create="(day, time) => openCreateForm(day, time)"
        @select="openEditForm"
      />
    </div>

    <!-- Floating add button -->
    <button
      @click="openCreateForm()"
      class="fixed bottom-20 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-blue-600 active:scale-95 transition-all z-20"
    >
      +
    </button>

    <!-- Modal / Bottom sheet -->
    <Teleport to="body">
      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/40"
          @click="handleCancel"
        ></div>

        <!-- Sheet -->
        <div class="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto p-5 z-10">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">
              {{ editingEvent ? 'Termin bearbeiten' : 'Neuer Termin' }}
            </h3>
            <button
              v-if="editingEvent"
              @click="handleDelete"
              class="text-red-500 text-sm font-medium hover:text-red-600"
            >
              Löschen
            </button>
          </div>

          <EventForm
            :event="formEvent"
            :member-id="currentMemberId"
            @save="handleSave"
            @cancel="handleCancel"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
