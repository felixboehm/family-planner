import { ref, computed } from 'vue'
import { useFamily } from './useFamily'
import { useEvents } from './useEvents'
import { useChildren } from './useChildren'
import { useCategories } from './useCategories'
import { useFairness } from './useFairness'
import { serializePlan } from '@/lib/planSerializer'
import type { PlanData } from '@/lib/planSerializer'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const messages = ref<ChatMessage[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useAssistant() {
  const { family, members } = useFamily()
  const { events, eventList } = useEvents()
  const { children, childList, careSlots } = useChildren()
  const { categories } = useCategories()
  const { currentWeekMetrics } = useFairness()

  function buildPlanContext(): string {
    const planData: PlanData = {
      familyName: family.value?.name ?? 'Unbekannt',
      members: Object.values(members.value),
      children: childList.value,
      events: eventList.value,
      careSlots: Object.values(careSlots.value),
      categories: categories.value,
      fairness: currentWeekMetrics.value,
    }
    return serializePlan(planData)
  }

  async function sendMessage(text: string): Promise<void> {
    if (!text.trim() || isLoading.value) return

    error.value = null

    // Add user message
    messages.value = [
      ...messages.value,
      {
        role: 'user',
        content: text.trim(),
        timestamp: Date.now(),
      },
    ]

    isLoading.value = true

    try {
      const context = buildPlanContext()
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8765'

      const response = await fetch(`${serverUrl}/assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          message: text.trim(),
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || `Fehler: ${response.status}`)
      }

      const data = await response.json()

      messages.value = [
        ...messages.value,
        {
          role: 'assistant',
          content: data.response,
          timestamp: Date.now(),
        },
      ]
    } catch (err: any) {
      error.value = err.message || 'Verbindungsfehler zum Server'
      // Add error as assistant message so user sees it
      messages.value = [
        ...messages.value,
        {
          role: 'assistant',
          content: `Entschuldigung, es ist ein Fehler aufgetreten: ${error.value}`,
          timestamp: Date.now(),
        },
      ]
    } finally {
      isLoading.value = false
    }
  }

  function clearMessages(): void {
    messages.value = []
    error.value = null
  }

  /**
   * Quick suggestion prompts based on current fairness state.
   */
  const quickSuggestions = computed<string[]>(() => {
    const suggestions: string[] = []
    const fairness = currentWeekMetrics.value

    if (!fairness || fairness.metrics.length === 0) {
      suggestions.push('Wie kann ich den Familienplan am besten aufbauen?')
      suggestions.push('Welche Kategorien sind sinnvoll fuer unsere Familie?')
      return suggestions
    }

    // Low overall score
    if (fairness.overallScore < 60) {
      suggestions.push('Die Fairness ist niedrig. Was koennen wir verbessern?')
    }

    // High contribution delta
    if (fairness.contributionDelta > 5) {
      const maxMember = fairness.metrics.reduce((a, b) =>
        a.familyContribution > b.familyContribution ? a : b,
      )
      suggestions.push(
        `${maxMember.memberName} traegt deutlich mehr bei. Wie koennen wir das ausgleichen?`,
      )
    }

    // Low wish balance
    if (fairness.wishBalanceRatio < 0.5) {
      suggestions.push('Die Wunschzeit ist ungleich verteilt. Hast du Vorschlaege?')
    }

    // Low wish fulfillment for any member
    for (const m of fairness.metrics) {
      if (m.wishFulfillmentRate < 0.5) {
        suggestions.push(`${m.memberName} hat wenig Wunschzeit. Wie laesst sich das aendern?`)
        break
      }
    }

    // Always offer some general suggestions
    if (suggestions.length < 2) {
      suggestions.push('Wie koennen wir den Wochenplan optimieren?')
    }
    suggestions.push('Gibt es Luecken in der Betreuung?')

    return suggestions.slice(0, 4)
  })

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    quickSuggestions,
  }
}
