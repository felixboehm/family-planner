<script setup lang="ts">
import { computed } from 'vue'
import type { FamilyEvent, Member, Category } from '@/types/family'
import { findConflicts, type TimeSlot, type Conflict } from '@/lib/conflicts'

const props = withDefaults(
  defineProps<{
    events: FamilyEvent[]
    members: Record<string, Member>
    categories: Record<string, Category>
    startHour?: number
    endHour?: number
  }>(),
  {
    startHour: 6,
    endHour: 22,
  },
)

const emit = defineEmits<{
  create: [day: number, time: string]
  select: [event: FamilyEvent]
}>()

const hourHeight = 60 // px per hour
const totalHours = computed(() => props.endHour - props.startHour)
const calendarHeight = computed(() => totalHours.value * hourHeight)

const hours = computed(() => {
  const h: number[] = []
  for (let i = props.startHour; i < props.endHour; i++) {
    h.push(i)
  }
  return h
})

// Days: Mo=1, Di=2, ... So=0
const days = [
  { value: 1, label: 'Mo' },
  { value: 2, label: 'Di' },
  { value: 3, label: 'Mi' },
  { value: 4, label: 'Do' },
  { value: 5, label: 'Fr' },
  { value: 6, label: 'Sa' },
  { value: 0, label: 'So' },
]

const todayDow = computed(() => new Date().getDay())

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function eventTop(event: FamilyEvent): number {
  const minutes = parseTimeToMinutes(event.startTime)
  const startMinutes = props.startHour * 60
  return ((minutes - startMinutes) / 60) * hourHeight
}

function eventHeight(event: FamilyEvent): number {
  const start = parseTimeToMinutes(event.startTime)
  const end = parseTimeToMinutes(event.endTime)
  return Math.max(((end - start) / 60) * hourHeight, 20)
}

function eventsForDay(dayOfWeek: number): FamilyEvent[] {
  return props.events.filter((e) => e.days.includes(dayOfWeek))
}

function memberColor(memberId: string): string {
  return props.members[memberId]?.color ?? '#6b7280'
}

function categoryEmoji(categoryId: string): string {
  return props.categories[categoryId]?.emoji ?? ''
}

// Conflict detection per day
const conflictsByDay = computed(() => {
  const result: Record<number, Conflict[]> = {}
  for (const day of days) {
    const dayEvents = eventsForDay(day.value)
    const slots: TimeSlot[] = dayEvents.map((e) => ({
      id: e.id,
      memberId: e.memberId,
      startTime: e.startTime,
      endTime: e.endTime,
      type: e.type,
      title: e.title,
    }))
    result[day.value] = findConflicts(slots)
  }
  return result
})

// Set of event IDs that are in conflict
const conflictEventIds = computed(() => {
  const ids = new Set<string>()
  for (const dayConflicts of Object.values(conflictsByDay.value)) {
    for (const c of dayConflicts) {
      ids.add(c.slotA.id)
      ids.add(c.slotB.id)
    }
  }
  return ids
})

function isConflict(eventId: string): boolean {
  return conflictEventIds.value.has(eventId)
}

function handleSlotClick(day: number, hour: number) {
  const time = `${hour.toString().padStart(2, '0')}:00`
  emit('create', day, time)
}
</script>

<template>
  <div class="overflow-x-auto">
    <div class="min-w-[640px]">
      <!-- Header row with day labels -->
      <div class="grid grid-cols-[50px_repeat(7,1fr)] border-b border-gray-200">
        <div class="h-10"></div>
        <div
          v-for="day in days"
          :key="day.value"
          class="h-10 flex items-center justify-center text-sm font-semibold"
          :class="[
            todayDow === day.value
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-600',
          ]"
        >
          {{ day.label }}
        </div>
      </div>

      <!-- Calendar body -->
      <div class="grid grid-cols-[50px_repeat(7,1fr)] relative">
        <!-- Time labels column -->
        <div class="relative" :style="{ height: calendarHeight + 'px' }">
          <div
            v-for="hour in hours"
            :key="hour"
            class="absolute w-full text-right pr-2 text-xs text-gray-400 leading-none -translate-y-1/2"
            :style="{ top: (hour - startHour) * hourHeight + 'px' }"
          >
            {{ hour.toString().padStart(2, '0') }}:00
          </div>
        </div>

        <!-- Day columns -->
        <div
          v-for="day in days"
          :key="day.value"
          class="relative border-l border-gray-100"
          :class="[todayDow === day.value ? 'bg-blue-50/30' : '']"
          :style="{ height: calendarHeight + 'px' }"
        >
          <!-- Hour grid lines (clickable slots) -->
          <div
            v-for="hour in hours"
            :key="hour"
            class="absolute w-full border-t border-gray-100 cursor-pointer hover:bg-gray-50/50"
            :style="{
              top: (hour - startHour) * hourHeight + 'px',
              height: hourHeight + 'px',
            }"
            @click="handleSlotClick(day.value, hour)"
          ></div>

          <!-- Event blocks -->
          <div
            v-for="evt in eventsForDay(day.value)"
            :key="evt.id"
            class="absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5 cursor-pointer overflow-hidden text-xs leading-tight z-10 transition-shadow hover:shadow-md"
            :style="{
              top: eventTop(evt) + 'px',
              height: eventHeight(evt) + 'px',
              backgroundColor: memberColor(evt.memberId) + '20',
              borderLeft: `3px ${evt.type === 'need' ? 'solid' : 'dashed'} ${memberColor(evt.memberId)}`,
            }"
            :class="[
              isConflict(evt.id)
                ? 'ring-2 ring-red-400 ring-offset-1 bg-red-50'
                : '',
            ]"
            @click.stop="emit('select', evt)"
          >
            <div class="flex items-center gap-0.5 font-medium truncate" :style="{ color: memberColor(evt.memberId) }">
              <span v-if="categoryEmoji(evt.categoryId)">{{ categoryEmoji(evt.categoryId) }}</span>
              <span class="truncate">{{ evt.title }}</span>
            </div>
            <div class="text-gray-500 truncate" v-if="eventHeight(evt) >= 36">
              {{ evt.startTime }} - {{ evt.endTime }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
