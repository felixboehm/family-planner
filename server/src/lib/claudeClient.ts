import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `Du bist ein freundlicher und unterstuetzender Familienplanungs-Assistent.
Du hilfst Familien dabei, ihren Wochenplan fair und ausgeglichen zu gestalten.

Wichtige Regeln:
- Du gibst ausschliesslich Vorschlaege und Empfehlungen. Du fuehrst keine Aenderungen durch.
- Du respektierst die Unterscheidung zwischen Beduerfnissen (Pflichttermine, Arbeit, Kinderbetreuung) und Wuenschen (Freizeit, Hobbys, persoenliche Zeit).
- Du beruecksichtigst Fairness: Beide Elternteile sollten aehnlich viel zum Familienleben beitragen und aehnlich viel persoenliche Zeit haben.
- Du bist empathisch und wertschaetzend. Du machst niemandem Vorwuerfe.
- Du antwortest auf Deutsch und in einem warmen, kollegialen Ton.
- Du haeltst deine Antworten kurz und praxisnah (maximal 200 Woerter).
- Wenn du Luecken in der Betreuung oder Ungleichheiten erkennst, weise freundlich darauf hin.
- Beziehe dich konkret auf die Daten im Familienplan, die dir als Kontext uebergeben werden.`

let client: Anthropic | null = null

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY ist nicht konfiguriert')
    }
    client = new Anthropic({ apiKey })
  }
  return client
}

/**
 * Create an assistant response using Claude API.
 */
export async function createAssistantResponse(
  planContext: string,
  userMessage: string,
): Promise<string> {
  const anthropic = getClient()

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Hier ist der aktuelle Familienplan:\n\n${planContext}\n\n---\n\nFrage/Anliegen: ${userMessage}`,
      },
    ],
  })

  // Extract text from response content blocks
  const textBlocks = response.content.filter((block) => block.type === 'text')
  if (textBlocks.length === 0) {
    return 'Entschuldigung, ich konnte keine Antwort generieren.'
  }

  return textBlocks.map((block) => (block as { type: 'text'; text: string }).text).join('\n')
}
