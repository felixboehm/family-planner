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
- [Architektur-Entscheidungen](docs/architecture.md)
- [Produktkonzept](specs/concept.md)

## Projektstruktur

```
docs/           Dokumentation, Vision, Architektur-Entscheidungen
specs/          Produktkonzept, Spezifikationen
```

## Lizenz

TBD
