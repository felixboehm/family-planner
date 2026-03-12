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
| Identität & Zugriff | GunDB SEA (User Space) | Familie = SEA Keypair, zertifikatsbasierter Schreibzugriff |
| Verschlüsselung | GunDB SEA (`SEA.encrypt`) | E2E-Verschlüsselung für sensible Daten (Finance) |
| Offline | GunDB lokal (IndexedDB) | Funktioniert ohne Verbindung, sync bei Reconnect |

**Datenprinzip:** GunDB ist die einzige State-Quelle – kein separater Store (kein Pinia, kein Vuex). Vue-Komponenten subscriben direkt auf GunDB-Nodes. Alle Familiendaten leben im Browser und werden direkt zwischen den Geräten der Familie synchronisiert.

### Familie als SEA User

Jede Familie wird als eigener GunDB SEA User modelliert. Das Family-Keypair (`SEA.pair()`) ist der zentrale Identitätsanker:

- **Family = SEA Keypair** – alle Familiendaten liegen im User-Space unter `gun.user(familyPub)`
- **Zertifikatsbasierter Schreibzugriff** – Mitglieder erhalten via `SEA.certify()` individuelle Schreibzertifikate für die Family-Nodes
- **E2E-Verschlüsselung** – sensible Daten (z.B. Finance) werden zusätzlich mit dem Family-Keypair verschlüsselt (`SEA.encrypt(data, familyPair)`)
- **Server als stilles Mitglied** – der Relay-Server besitzt ein eigenes SEA-Keypair und wird automatisch als Mitglied hinzugefügt, damit er iCal, Push und KI-Funktionen ausführen kann

### GunDB-Datenstruktur (SEA User Space)

```
gun.user(familyPub)
  ├── members/{pubKey}     → Profildaten
  ├── events/{eventId}     → Termine mit Typ, Kategorie, Wiederholung
  ├── children/{childId}   → Kind-Profile
  │     └── slots/{slotId} → Betreuungsslots
  ├── requests/{reqId}     → Tausch-Requests + Status
  ├── categories/{catId}   → Eigene Kategorien
  ├── finance/             → Finanzdaten (verschlüsselt)
  └── certs/{pubKey}       → Schreibzertifikate pro Mitglied
```

## Relay-Server (TypeScript)

Ein einzelner TypeScript-Server vereint alle serverseitigen Funktionen:

| Funktion | Endpunkt / Mechanismus | Beschreibung |
|---|---|---|
| GunDB Relay | WebSocket | Sync-Relay für alle verbundenen Clients |
| iCal Feed | `GET /ical/:familyId/:scope` | Generiert .ics on-the-fly aus GunDB-Daten |
| Push Service | Web Push API | VAPID-basiert, getriggert durch GunDB-Listener |
| KI-Assistent | `POST /assist` | Leitet Kontext an Claude API, gibt Text zurück |

**Architektur-Prinzip:** Der Server ist ein erweiterter GunDB-Relay. Er besitzt ein eigenes SEA-Keypair (`serverIdentity`) und wird beim Erstellen einer Familie als stilles Mitglied mit eigenem Schreibzertifikat hinzugefügt. Dadurch kann er die Familiendaten lesen und auf relevante Nodes reagieren (Push-Trigger, iCal-Generierung). Der Server speichert selbst keinen Zustand – alle Daten fließen durch GunDB.

Siehe [Architektur-Entscheidung](architecture.md) für die Analyse warum ein eigener Relay-Server nötig ist.
