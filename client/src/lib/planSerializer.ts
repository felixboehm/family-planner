import type { Member, FamilyEvent, CareSlot, Child, Category } from '@/types/family'
import type { FairnessResult } from '@/lib/fairnessCalc'

const DAY_NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

function formatDays(days: number[]): string {
  return days
    .sort((a, b) => a - b)
    .map((d) => DAY_NAMES[d])
    .join(', ')
}

function formatRecurrence(r: string): string {
  switch (r) {
    case 'daily':
      return 'taeglich'
    case 'weekly':
      return 'woechentlich'
    case 'biweekly':
      return 'alle 2 Wochen'
    default:
      return r
  }
}

export interface PlanData {
  familyName: string
  members: Member[]
  children: Child[]
  events: FamilyEvent[]
  careSlots: CareSlot[]
  categories: Record<string, Category>
  fairness: FairnessResult | null
}

/**
 * Serializes the family plan into German plain text for AI context.
 */
export function serializePlan(data: PlanData): string {
  const lines: string[] = []

  // Header
  lines.push(`=== Familienplan: ${data.familyName} ===`)
  lines.push('')

  // Members
  lines.push('--- Familienmitglieder ---')
  if (data.members.length === 0) {
    lines.push('Keine Mitglieder eingetragen.')
  } else {
    for (const m of data.members) {
      lines.push(`- ${m.name}`)
    }
  }
  lines.push('')

  // Children
  if (data.children.length > 0) {
    lines.push('--- Kinder ---')
    for (const c of data.children) {
      lines.push(`- ${c.name} (geb. ${c.birthDate})`)
    }
    lines.push('')
  }

  // Events by person
  lines.push('--- Termine pro Person ---')
  for (const member of data.members) {
    const memberEvents = data.events.filter((e) => e.memberId === member.id)
    lines.push(`\n${member.name}:`)
    if (memberEvents.length === 0) {
      lines.push('  Keine Termine.')
    } else {
      for (const evt of memberEvents) {
        const cat = data.categories[evt.categoryId]
        const catLabel = cat ? `${cat.emoji} ${cat.name}` : 'Unbekannt'
        const typeLabel = evt.type === 'need' ? 'Beduerfnis' : 'Wunsch'
        lines.push(
          `  - ${evt.title} [${catLabel}, ${typeLabel}]` +
            ` | ${formatDays(evt.days)} ${evt.startTime}-${evt.endTime}` +
            ` (${formatRecurrence(evt.recurrence)})`,
        )
      }
    }
  }
  lines.push('')

  // Care slots
  if (data.careSlots.length > 0) {
    lines.push('--- Betreuungszeiten ---')
    for (const slot of data.careSlots) {
      const child = data.children.find((c) => c.id === slot.childId)
      const childName = child?.name ?? 'Unbekannt'
      let assignee: string
      if (slot.assignedTo === 'both') {
        assignee = 'Beide'
      } else if (slot.assignedTo === 'external') {
        assignee = slot.externalName ?? 'Extern'
      } else {
        const m = data.members.find((mem) => mem.id === slot.assignedTo)
        assignee = m?.name ?? 'Unbekannt'
      }
      lines.push(
        `  - ${childName}: ${assignee}` +
          ` | ${formatDays(slot.days)} ${slot.startTime}-${slot.endTime}` +
          ` (${formatRecurrence(slot.recurrence)})`,
      )
    }

    // Detect gaps: days without any care slot
    if (data.children.length > 0) {
      const coveredDays = new Set<number>()
      for (const slot of data.careSlots) {
        for (const d of slot.days) {
          coveredDays.add(d)
        }
      }
      const weekDays = [1, 2, 3, 4, 5] // Mo-Fr
      const uncoveredDays = weekDays.filter((d) => !coveredDays.has(d))
      if (uncoveredDays.length > 0) {
        lines.push(`  Luecken (Mo-Fr ohne Betreuung): ${formatDays(uncoveredDays)}`)
      }
    }
    lines.push('')
  }

  // Fairness metrics
  if (data.fairness && data.fairness.metrics.length > 0) {
    lines.push('--- Fairness-Metriken (aktuelle Woche) ---')
    lines.push(`Gesamtscore: ${data.fairness.overallScore}/100`)
    lines.push(`Beitragsdifferenz: ${data.fairness.contributionDelta} Stunden`)
    lines.push(`Wunsch-Balance: ${Math.round(data.fairness.wishBalanceRatio * 100)}%`)
    lines.push('')
    for (const m of data.fairness.metrics) {
      lines.push(`${m.memberName}:`)
      lines.push(`  Familienbeitrag: ${m.familyContribution}h`)
      lines.push(`  Persoenliche Beduerfnisse: ${m.personalNeed}h`)
      lines.push(`  Persoenliche Wuensche: ${m.personalWish}h`)
      lines.push(`  Wunsch-Erfuellungsrate: ${Math.round(m.wishFulfillmentRate * 100)}%`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
