# Tech Stack

## Frontend

| Schicht | Technologie | Begründung |
|---|---|---|
| Framework | Vue.js 3 (Composition API) | Leichtgewichtig, reaktiv, gute Mobile-Performance |
| Styling | Tailwind CSS | Utility-first, konsistentes Design-System |
| PWA | Vite PWA Plugin | Offline-fähig, installierbar auf Mobile |

## Datenschicht

| Schicht | Technologie | Begründung |
|---|---|---|
| Datenbank + State | GunDB | P2P, Echtzeit-Sync, reaktiv als einzige State-Quelle |
| Sync | Eigener GunDB Relay (TypeScript) | Volle Kontrolle, erweiterbar um API-Endpunkte |
| Verschlüsselung | GunDB SEA | Ende-zu-Ende für alle Familiendaten |
| Offline | GunDB lokal (IndexedDB) | Funktioniert ohne Verbindung, sync bei Reconnect |

**Datenprinzip:** GunDB ist die einzige State-Quelle – kein separater Store (kein Pinia, kein Vuex). Vue-Komponenten subscriben direkt auf GunDB-Nodes. Alle Familiendaten leben im Browser und werden direkt zwischen den Geräten der Familie synchronisiert.

**GunDB-Datenstruktur (vereinfacht):**

- `family/{id}/members/{personId}` → Profildaten
- `family/{id}/events/{eventId}` → Termine mit Typ, Kategorie, Wiederholung
- `family/{id}/children/{childId}/slots/{slotId}` → Betreuungsslots
- `family/{id}/requests/{requestId}` → Tausch-Requests + Status
- `family/{id}/categories/{categoryId}` → Eigene Kategorien

## Relay-Server (TypeScript)

Ein einzelner TypeScript-Server vereint alle serverseitigen Funktionen:

| Funktion | Endpunkt / Mechanismus | Beschreibung |
|---|---|---|
| GunDB Relay | WebSocket | Sync-Relay für alle verbundenen Clients |
| iCal Feed | `GET /ical/:familyId/:scope` | Generiert .ics on-the-fly aus GunDB-Daten |
| Push Service | Web Push API | VAPID-basiert, getriggert durch GunDB-Listener |
| KI-Assistent | `POST /assist` | Leitet Kontext an Claude API, gibt Text zurück |

**Architektur-Prinzip:** Der Server ist ein erweiterter GunDB-Relay. Er hat lesenden Zugang zu den synchronisierten Daten, speichert aber selbst keinen Zustand. Alle Daten fließen durch GunDB – der Server subscribed auf relevante Nodes und reagiert darauf (Push-Trigger, iCal-Generierung).

Siehe [Architektur-Entscheidung](architecture.md) für die Analyse warum ein eigener Relay-Server nötig ist.
