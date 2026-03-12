# Architektur-Entscheidung: Eigener Relay-Server

## Kontext

Das ursprüngliche Konzept (v0.4) sah eine rein clientseitige Architektur vor, bei der GunDB über öffentliche Relays synchronisiert und der KI-Assistent als einziger Serverteil lief. Die Analyse von iCal-Live-Feeds und Push-Notifications zeigt, dass ein eigener Server notwendig ist.

## Analyse

### iCal Live-Feed

| Ansatz | Server nötig? | Beschreibung |
|---|---|---|
| Einmal-Export (.ics) | Nein | Browser generiert .ics aus GunDB, Nutzer lädt Datei herunter |
| Live-Feed (Abo-URL) | **Ja** | Kalender-Apps pollen eine HTTP-URL periodisch. Browser kann keine URL bereitstellen, die extern erreichbar ist |

Kalender-Apps (Google Calendar, Apple Calendar, Outlook) unterstützen `.ics`-Abos über HTTP(S)-URLs. Diese müssen von einem Server beantwortet werden, da der Browser des Nutzers nicht als Server fungieren kann.

### Push-Notifications

| Ansatz | Server nötig? | Beschreibung |
|---|---|---|
| Browser Notification API | Nein | Nur wenn App im Vordergrund – nicht ausreichend |
| Web Push API | **Ja** | Benötigt VAPID-Keys und einen Server, der Push-Messages an den Push-Service sendet |

Web Push erfordert einen Server, der:
1. VAPID-Schlüsselpaar verwaltet
2. Subscription-Endpunkte der Clients speichert
3. Push-Messages an den Browser-Push-Service sendet

### KI-Assistent

| Ansatz | Server nötig? | Beschreibung |
|---|---|---|
| Direkt vom Client | Nein | API-Key im Client → Sicherheitsrisiko |
| Über Server-Proxy | **Ja** | API-Key sicher auf dem Server, Client sendet nur Kontext |

## Entscheidung

**Ein einzelner TypeScript-Server, der GunDB-Relay und API-Endpunkte vereint.**

### Warum ein kombinierter Server?

1. **GunDB-Relay sowieso sinnvoll** – eigener Relay statt öffentlicher Relays gibt volle Kontrolle über Verfügbarkeit und Performance
2. **Relay hat Datenzugang** – als GunDB-Peer sieht der Server die synchronisierten Daten und kann darauf reagieren (iCal generieren, Push triggern)
3. **Ein Deployment** – statt drei separate Services (Relay, iCal-Server, Push-Server, KI-API) läuft alles in einem Prozess
4. **GunDB-Hooks** – der Server kann auf Datenänderungen in GunDB lauschen und darauf reagieren (z.B. Push bei neuem Tausch-Request)

### Architektur

```
┌─────────────────────────────────────────┐
│           Relay-Server (TypeScript)      │
│                                         │
│  ┌─────────────┐  ┌──────────────────┐  │
│  │ GunDB Relay │  │ API-Endpunkte    │  │
│  │ (WebSocket) │  │                  │  │
│  │             │  │ GET  /ical/:id   │  │
│  │  ┌───────┐  │  │ POST /assist     │  │
│  │  │Hooks/ │  │  │ POST /push/sub   │  │
│  │  │Listener│ │  │                  │  │
│  │  └───┬───┘  │  └──────────────────┘  │
│  │      │      │           │            │
│  │      ▼      │           ▼            │
│  │  Push-Trigger│    Claude API         │
│  │  iCal-Gen   │    Web Push Service   │
│  └─────────────┘                        │
└─────────────────────────────────────────┘
         ▲              ▲
         │ WebSocket    │ HTTPS
         │ (GunDB Sync) │ (API Calls)
         ▼              ▼
┌─────────────────────────────────────────┐
│        Client (Vue.js PWA)              │
│  GunDB ←→ Vue Components               │
│  Service Worker (Push-Empfang)          │
└─────────────────────────────────────────┘
```

### Datenschutz-Implikation

Mit einem eigenen Relay-Server hat der Betreiber theoretisch Zugang zu den synchronisierten Daten. GunDB SEA (Verschlüsselung) bleibt daher essenziell – der Server sieht nur verschlüsselte Daten. Für iCal und Push muss der Server bestimmte Daten lesen können, daher werden nur die dafür nötigen Nodes mit einem separaten Schlüssel geteilt.

## Status

Akzeptiert – ersetzt den öffentlichen Relay-Ansatz aus Konzept v0.4.
