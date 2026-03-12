# Family-Planner – Produktkonzept

**Version 0.4 · März 2026**

---

## Vision

Ein kollaborativer Familienplaner, der Betreuung, Haushalt und persönliche Zeit fair und unterstützend organisiert – mit Respekt für das, was jeder braucht, und Raum für das, was jeder sich wünscht.

> *"Bedürfnisse werden geschützt. Wünsche werden ermöglicht."*

---

## Leitprinzip: Bedürfnis vs. Wunsch

| | Bedürfnis 🔵 | Wunsch 🟡 |
|---|---|---|
| **Definition** | Notwendig für Stabilität der Familie oder Person | Wichtig für Wohlbefinden, aber nicht existenziell |
| **Beispiele** | Kinderbetreuung, Schlaf, Einkommen, Mahlzeiten | Sport, Studium, Hobby, Freundeszeit |
| **Verhalten** | Wird geschützt – darf nicht wegfallen | Wird ermöglicht – wenn Kapazität vorhanden |
| **Konflikt** | Hat Vorrang | Tritt zurück |

**Ziel:** Kein Partner muss Bedürfnisse opfern. Wünsche beider werden aktiv eingeplant, soweit möglich.

---

## Problem

Familienplanung scheitert oft nicht an mangelndem Willen, sondern an fehlender Struktur. Bedürfnisse werden nicht benannt, Wünsche werden schuldhaft verfolgt oder unterdrückt. Der Family-Planner schafft einen gemeinsamen, neutralen Rahmen.

---

## Zielgruppe

| Segment | Beschreibung |
|---|---|
| **Primär** | Paare mit Kleinkindern (0–5 J.), asymmetrische Rollen |
| **Sekundär** | Patchwork-Familien, Alleinerziehende mit Co-Parenting |
| **Tertiär** | WGs mit Haushaltspflichten |

---

## Datenmodell: Profile

**Familie**

- Person A (Felix)
  - Bedürfnisse 🔵: Erwerbsarbeit Mo–Fr 9–14h, 7h Schlaf
  - Wünsche 🟡: Sport Mi 18–19:30h, Projektzeit Sa

- Person B (Tina)
  - Bedürfnisse 🔵: 7h Schlaf, Erholungszeit
  - Wünsche 🟡: Studium (Vorlesung, Lernen), Yoga Sa

- Kind (Ben, 3J)
  - Bedürfnisse 🔵: Mittagsschlaf 13–15h, Mahlzeiten, Betreuung
  - Wünsche 🟡: Spielgruppe, Ausflüge, Vorlesezeit

---

## Kategorien & Einordnung

| Kategorie | Typ | Gewichtung | Beispiele |
|---|---|---|---|
| 💼 Erwerbsarbeit | 🔵 Bedürfnis | Familienbeitrag (finanziert) | Job, Freelance |
| 🍳 Haushalt (Basis) | 🔵 Bedürfnis | Familienbeitrag | Kochen, Einkaufen |
| 👶 Kinderbetreuung | 🔵 Bedürfnis | Familienbeitrag | Aufsicht, Pflege |
| 😴 Schlaf & Erholung | 🔵 Bedürfnis | Persönlich | Nachtschlaf, Mittagsschlaf |
| 📚 Studium / Weiterbildung | 🟡 Wunsch | Privat / selbstgewählt | Vorlesung, Lernen |
| 🏃 Sport & Bewegung | 🟡 Wunsch | Persönliches Wohlbefinden | Fußball, Yoga, Laufen |
| 🎨 Hobby & Kreativzeit | 🟡 Wunsch | Persönliches Wohlbefinden | Musik, Projekte |
| 👫 Paarzeit | 🟡 Wunsch | Beziehungspflege | Date Night, gemeinsame Zeit |

---

## Kernfunktionen

### 1. Persönliche Terminverwaltung

Jede Person trägt eigene **wiederkehrende Termine** ein und klassifiziert sie:

- Titel, Kategorie, Farbe
- **Typ: Bedürfnis 🔵 oder Wunsch 🟡**
- Wochentag(e) + Uhrzeit
- Wiederholungsregel: täglich / wöchentlich / alle 2 Wochen
- Optional: Enddatum (z.B. Semesterende)

---

### 2. Kind-Profil & Betreuungsplanung

Das Kind hat ein eigenes Profil mit Tagesrhythmus und Terminen.

**Betreuungsslots:**
- Zuständig: Person A, B, Beide, Extern (Kita, Tagesmutter, Großeltern)
- Extern zählt nicht in die Familienbilanz

**Automatische Übertragung:** Betreuungsslots erscheinen im Kalender der zuständigen Person automatisch als `👶 Bedürfnis 🔵`.

**Wünsche des Kindes:** Ausflüge oder Spielgruppe als 🟡 Wunsch einplanbar, wenn Kapazität vorhanden.

---

### 3. Gemeinsamer Familienplan

- Farbkodierung nach Person + Typ (🔵/🟡)
- **Betreuungslücken:** Kind ohne Zuständige → sofort markiert 🔴
- **Wunsch-Konflikte:** Beide wollen gleichzeitig frei → Verhandlungsvorschlag
- **Bedürfnis-Schutz:** Konflikte mit 🔵-Terminen werden priorisiert und gewarnt

---

### 4. Kollaborationsmodus

- Beide Partner bearbeiten denselben Plan in Echtzeit via GunDB
- Tausch-Request: "Kannst du Mi Nachmittag übernehmen?" → Partner bestätigt oder lehnt ab
- Kommentarfunktion pro Slot
- Push-Benachrichtigung bei Änderungen oder offenen Anfragen

---

### 5. Automatische Auswertung

Pro Person – wöchentlich:

| Metrik | Beschreibung |
|---|---|
| Familienbeitrag | Arbeit + Betreuung + Haushalt |
| Privatzeit (Bedürfnis) | Schlaf, Erholung |
| Privatzeit (Wunsch) | Studium, Sport, Hobby |
| Wunsch-Erfüllungsrate | % der geplanten Wünsche die stattfanden |

**Fairness-Score:** Familienbeitrag A vs. B (Δ in Stunden) und Wunsch-Balance: Hat jeder genug Raum für persönliche Ziele?

---

### 6. Finanzmodul

- Stundensatz + Steuerprofil → Nettoeinkommen
- Fixkosten-Editor
- Externe Betreuungskosten (Kita, Tagesmutter)
- Szenario: "Was kostet eine Tagesmutter – und welche Wünsche werden dadurch realisierbar?"

---

### 7. iCal-Export

Jede Person kann ihren persönlichen Kalender als `.ics`-Datei exportieren oder als Live-Feed abonnieren:

- **Einzelperson:** Nur eigene Termine + zugewiesene Betreuungsslots
- **Familie:** Alle Termine aller Mitglieder zusammen
- **Kind:** Tagesstruktur + Betreuungszeiten

Der iCal-Feed wird direkt aus GunDB im Browser generiert – kein Server beteiligt. Kompatibel mit Google Calendar, Apple Calendar, Outlook und allen standard-konformen Kalenderanwendungen.

---

### 8. KI-Assistent ✨

Ein sanfter Vorschlagsmodus über eine schlanke Text-API:

**Funktionsweise:** Der Client serialisiert den aktuellen Familienplan aus GunDB als Klartext und schickt ihn an einen minimalen API-Endpunkt. Der Server leitet die Anfrage an das KI-Modell weiter und gibt Text zurück. Keine Datenspeicherung serverseitig – der Kontext lebt ausschließlich in GunDB auf den Geräten der Familie.

**Beispiel-Interaktionen:**

> *"Tinas Wunsch Yoga Sa 9–10h ist diese Woche noch nicht gedeckt. Felix hat Sa 8–10h frei. Soll ich einen Tausch vorschlagen?"*

> *"Diese Woche trägt Felix 12h mehr Familienbeitrag als Tina. Hier sind drei Möglichkeiten das anzugleichen."*

> *"Ben hatte diese Woche 3h weniger Elternzeit als üblich. Möchtet ihr das Wochenende anders planen?"*

Nur Vorschläge, keine automatischen Änderungen. Beide müssen Tausch-Requests bestätigen.

---

## Technischer Stack

### Frontend

| Schicht | Technologie | Begründung |
|---|---|---|
| Framework | Vue.js 3 (Composition API) | Leichtgewichtig, reaktiv, gute Mobile-Performance |
| Styling | Tailwind CSS | Utility-first, konsistentes Design-System |
| PWA | Vite PWA Plugin | Offline-fähig, installierbar auf Mobile |

### Datenschicht

| Schicht | Technologie | Begründung |
|---|---|---|
| Datenbank + State | GunDB | P2P, kein eigenes Backend, Echtzeit-Sync, reaktiv als einzige State-Quelle |
| Sync | GunDB Public Relay | Kostenlos, dezentral, kein Server zu betreiben |
| Verschlüsselung | GunDB SEA | Ende-zu-Ende für alle Familiendaten |
| Offline | GunDB lokal (IndexedDB) | Funktioniert ohne Verbindung, sync bei Reconnect |

**Datenprinzip:** GunDB ist die einzige State-Quelle – kein separater Store (kein Pinia, kein Vuex). Vue-Komponenten subscriben direkt auf GunDB-Nodes. Alle Familiendaten leben im Browser und werden direkt zwischen den Geräten der Familie synchronisiert. Kein zentraler Server sieht jemals die Inhalte.

**GunDB-Datenstruktur (vereinfacht):**

- `family/{id}/members/{personId}` → Profildaten
- `family/{id}/events/{eventId}` → Termine mit Typ, Kategorie, Wiederholung
- `family/{id}/children/{childId}/slots/{slotId}` → Betreuungsslots
- `family/{id}/requests/{requestId}` → Tausch-Requests + Status

### KI-Assistent (Server)

| Schicht | Technologie | Begründung |
|---|---|---|
| Server | Node.js + Express (minimal) | Einziger Serverteil der App |
| API | POST /assist – Text rein, Text raus | Kein Zustand, kein Speicher |
| Modell | Claude API | Kontextverständnis für Familienszenarien |

Der KI-Server ist zustandslos. Jede Anfrage enthält den vollständigen Kontext als Text und erhält eine Antwort. Kein Session-Handling, keine Logs.

---

## Monetarisierung

| Modell | Details |
|---|---|
| **Free** | 2 Personen, 1 Kind, 4 Wochen Verlauf, iCal-Export |
| **Family (4,99€/Mo)** | Mehrere Kinder, unbegrenzte Historie, Tausch-Requests |
| **Premium (9,99€/Mo)** | Finanzmodul, KI-Assistent, Szenarienvergleich, Extern-Zugang |

---

## Roadmap

### MVP (Monat 1–2)
- Vue.js + Tailwind + GunDB als State
- Persönliche Termine mit 🔵/🟡-Klassifikation
- Kind-Profil mit Betreuungszuweisung
- Lücken- und Konflikterkennung
- Fairness-Score

### v1.0 (Monat 3–4)
- Tausch-Request zwischen Partnern
- iCal-Export (Einzel + Familie)
- Finanzmodul
- Verlaufsansicht 4 Wochen

### v1.5 (Monat 5–6)
- PWA – installierbar auf iOS/Android
- Push-Benachrichtigungen bei Planänderung
- GunDB SEA Verschlüsselung aktiviert

### v2.0 (Monat 7–12)
- KI-Assistent (Text-API)
- Mehrere Kinder
- Extern-Zugang (Tagesmutter, Großeltern)
- iCal Live-Feed-Abo

---

## Differenzierung

| Wettbewerb | Schwäche | Family-Planner-Vorteil |
|---|---|---|
| Google Calendar | Keine Fairness-Analyse | Bedürfnis/Wunsch-Ebene, Familienbilanz |
| Cozi / FamCal | Nur Termine, kein P2P | GunDB: kein Server, volle Datenkontrolle |
| Spreadsheets | Statisch, kein Sync | Kollaborativ, live, offline-fähig |
| Andere Apps | Zentraler Server, Datenschutzrisiko | Dezentral, Ende-zu-Ende verschlüsselt |

---

## Kernbotschaft

**Family-Planner schützt was jeder braucht – und ermöglicht was jeder sich wünscht. Dezentral, kollaborativ, ohne Server.**

---

*Konzept v0.4 · Tech Stack: Vue.js · Tailwind · GunDB · iCal · KI-Assistent*
*Entwickelt auf Basis eines realen Familienmodells · Felix & Tina, Ben (3J)*
