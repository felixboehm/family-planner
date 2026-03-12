# Family-Planner

Kollaborativer Familienplaner – Betreuung, Haushalt und persönliche Zeit fair organisiert.

## Projektstruktur

```
docs/           Dokumentation, Strategie, Technik
  vision.md       Vision, Mission, Werte
  techstack.md    Tech Stack, GunDB-Struktur, Relay-Server
  architecture.md ADR: Eigener Relay-Server, ADR: SEA User Space
  monetization.md Pricing-Tiers
  competition.md  Wettbewerbsvergleich
specs/          Feature-Spezifikationen (spec-driven development)
  principles.md       Leitprinzip Bedürfnis vs. Wunsch, Zielgruppe
  categories.md       Kategorien-System (Standard + eigene)
  family-calendar.md  Terminverwaltung, Familienplan, Konflikterkennung
  childcare.md        Kind-Profil, Betreuungsslots, Lückenerkennung
  collaboration.md    Echtzeit-Kollaboration, Tausch-Requests
  fairness-score.md   Auswertung, Metriken, Fairness-Score
  finance.md          Finanzmodul, Szenarien
  ical-feed.md        iCal Export + Live-Feed
  push-notifications.md  Web Push
  ai-assistant.md     KI-Vorschlagsmodus
  gundb-data-model.md GunDB SEA Datenmodell, Sharing, Migrationsplan
client/src/
  lib/sea.ts              SEA-Hilfsfunktionen (Keypair, Zertifikate, Verschlüsselung)
  composables/useInvite.ts  Einladungsflow (Code/QR generieren, einlösen)
server/src/
  lib/serverIdentity.ts   Persistentes Server-Keypair für SEA-Integration
```

## Tech Stack

- **Frontend:** Vue.js 3 (Composition API), Tailwind CSS, Vite PWA
- **Daten:** GunDB als einzige State-Quelle (kein Pinia/Vuex), GunDB SEA User Space (Familie = Keypair), Zertifikate für Schreibzugriff, E2E-Verschlüsselung für sensible Daten
- **Server:** TypeScript GunDB Relay mit API-Endpunkten (iCal, Push, KI-Assistent)
- **KI:** Claude API via Relay-Server

## Architektur-Prinzipien

- GunDB ist Single Source of Truth – Vue-Komponenten subscriben direkt auf GunDB-Nodes
- Der Relay-Server ist zustandslos – alle Daten fließen durch GunDB
- Offline-first: App funktioniert ohne Verbindung, sync bei Reconnect
- Ende-zu-Ende verschlüsselt: Server sieht nur verschlüsselte Daten (Ausnahme: explizit geteilte Nodes für iCal/Push)

## Konventionen

- Sprache: Deutsch für Docs und Specs, Englisch für Code und Commit-Messages
- Commits folgen Semantic Commit Messages (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`)
- Jedes Feature hat eine eigene Spec in `specs/` bevor die Implementierung beginnt
- Neue Architektur-Entscheidungen werden als ADR in `docs/` dokumentiert
