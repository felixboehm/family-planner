import { execFile } from 'child_process'

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

/**
 * Create an assistant response using `claude -p` CLI.
 */
export async function createAssistantResponse(
  planContext: string,
  userMessage: string,
): Promise<string> {
  const prompt = `${SYSTEM_PROMPT}\n\nHier ist der aktuelle Familienplan:\n\n${planContext}\n\n---\n\nFrage/Anliegen: ${userMessage}`

  return new Promise((resolve, reject) => {
    const child = execFile(
      'claude',
      ['-p', prompt],
      { maxBuffer: 1024 * 1024, timeout: 60000 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`claude CLI error: ${error.message}`))
          return
        }
        const response = stdout.trim()
        if (!response) {
          reject(new Error('Empty response from claude CLI'))
          return
        }
        resolve(response)
      },
    )
  })
}
