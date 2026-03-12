# Family-Planner

Kollaborativer Familienplaner – Betreuung, Haushalt und persönliche Zeit fair organisiert.

> *"Bedürfnisse werden geschützt. Wünsche werden ermöglicht."*

## Was ist das?

Family-Planner hilft Familien, ihren Alltag fair zu organisieren. Jeder Termin wird als **Bedürfnis** (muss geschützt werden) oder **Wunsch** (wird ermöglicht, wenn Kapazität da ist) eingestuft. So wird sichtbar, wer wie viel beiträgt – und ob beide genug Raum für persönliche Ziele haben.

## Features

- **Persönliche Termine** mit Bedürfnis/Wunsch-Klassifikation
- **Betreuungsplanung** mit Lückenerkennung
- **Fairness-Score** – Familienbeitrag und Wunsch-Balance im Blick
- **Echtzeit-Kollaboration** – gemeinsamer Plan, Tausch-Requests
- **iCal-Feed** – Abo in Google Calendar, Apple Calendar, Outlook
- **Push-Benachrichtigungen** bei Planänderungen
- **KI-Assistent** – Vorschläge für fairere Planung
- **Eigene Kategorien** – flexibel erweiterbar
- **Offline-fähig** als PWA

## Tech Stack

| Komponente | Technologie |
|---|---|
| Frontend | Vue.js 3, Tailwind CSS, Vite PWA |
| Daten & Sync | GunDB (P2P, E2E-verschlüsselt) |
| Server | TypeScript GunDB Relay + API-Endpunkte |
| KI | Claude API |

## Dokumentation

- [Vision & Mission](docs/vision.md)
- [Tech Stack](docs/techstack.md)
- [Architektur-Entscheidungen](docs/architecture.md)
- [Monetarisierung](docs/monetization.md)
- [Differenzierung](docs/competition.md)

## Spezifikationen

- [Leitprinzipien](specs/principles.md) – Bedürfnis vs. Wunsch, Zielgruppe
- [Kategorien](specs/categories.md) – Standard- und eigene Kategorien
- [Familienkalender](specs/family-calendar.md) – Terminverwaltung, Familienplan, Konflikterkennung
- [Betreuungsplanung](specs/childcare.md) – Kind-Profil, Betreuungsslots, Lückenerkennung
- [Kollaboration](specs/collaboration.md) – Echtzeit-Bearbeitung, Tausch-Requests
- [Fairness-Score](specs/fairness-score.md) – Auswertung, Metriken
- [Finanzmodul](specs/finance.md) – Einkommen, Kosten, Szenarien
- [iCal-Feed](specs/ical-feed.md) – Export und Live-Abo
- [Push-Benachrichtigungen](specs/push-notifications.md) – Web Push bei Planänderungen
- [KI-Assistent](specs/ai-assistant.md) – Vorschlagsmodus
- [GunDB Datenmodell](specs/gundb-data-model.md) – SEA-basiertes Sharing, Zertifikate, Einladungsflow

## Projektstruktur

```
docs/           Dokumentation, Vision, Tech Stack, Architektur-Entscheidungen
specs/          Feature-Spezifikationen (spec-driven development)
```

## Lizenz

TBD
