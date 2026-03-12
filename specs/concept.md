# Family-Planner – Produktkonzept

**Version 0.5 · März 2026**

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

## Kategorien & Einordnung

Die App liefert vordefinierte Standard-Kategorien. Nutzer können jederzeit **eigene Kategorien hinzufügen**, umbenennen oder entfernen. Jede Kategorie wird einem Typ (🔵 Bedürfnis / 🟡 Wunsch) und einer Gewichtung zugeordnet.

### Standard-Kategorien

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

### Eigene Kategorien

Nutzer können eigene Kategorien erstellen mit:
- Name und Emoji/Icon
- Typ: Bedürfnis 🔵 oder Wunsch 🟡
- Gewichtung: Familienbeitrag, Persönlich, oder eigene Bezeichnung
- Sichtbarkeit: nur für sich oder für die ganze Familie

Eigene Kategorien werden in der Familienbilanz und dem Fairness-Score gleichwertig berücksichtigt.

---

## Kernfunktionen

### 1. Persönliche Terminverwaltung

Jede Person trägt eigene **wiederkehrende Termine** ein und klassifiziert sie:

- Titel, Kategorie (Standard oder eigene), Farbe
- **Typ: Bedürfnis 🔵 oder Wunsch 🟡**
- Wochentag(e) + Uhrzeit
- Wiederholungsregel: täglich / wöchentlich / alle 2 Wochen
- Optional: Enddatum (z.B. Semesterende)

---

### 2. Kind-Profil & Betreuungsplanung

Jedes Kind hat ein eigenes Profil mit Tagesrhythmus und Terminen.

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

### 7. iCal-Feed

Jede Person kann ihren persönlichen Kalender als `.ics`-Datei exportieren oder als **Live-Feed abonnieren**:

- **Einzelperson:** Nur eigene Termine + zugewiesene Betreuungsslots
- **Familie:** Alle Termine aller Mitglieder zusammen
- **Kind:** Tagesstruktur + Betreuungszeiten

**Einmal-Export:** Wird direkt im Browser aus GunDB generiert – kein Server beteiligt.

**Live-Feed (Abo):** Wird über den Relay-Server bereitgestellt. Der Server liest die Familiendaten aus GunDB und generiert den `.ics`-Feed on-the-fly. Kalender-Apps (Google Calendar, Apple Calendar, Outlook) pollen diesen Endpunkt periodisch.

---

### 8. Push-Benachrichtigungen

Web Push Notifications bei:
- Planänderungen durch den Partner
- Offenen Tausch-Requests
- Betreuungslücken

Technisch über die Web Push API: Der Relay-Server hält VAPID-Keys und sendet Push-Messages an registrierte Service Worker. GunDB-Listener auf dem Server triggern Notifications bei relevanten Datenänderungen.

---

### 9. KI-Assistent

Ein sanfter Vorschlagsmodus als Agent auf dem Relay-Server:

**Funktionsweise:** Der Client serialisiert den aktuellen Familienplan aus GunDB als Klartext und schickt ihn an den Relay-Server. Der KI-Agent analysiert den Plan und gibt Vorschläge als Text zurück. Keine Datenspeicherung serverseitig – der Kontext lebt ausschließlich in GunDB auf den Geräten der Familie.

**Beispiel-Interaktionen:**

> *"Person Bs Wunsch Yoga Sa 9–10h ist diese Woche noch nicht gedeckt. Person A hat Sa 8–10h frei. Soll ich einen Tausch vorschlagen?"*

> *"Diese Woche trägt Person A 12h mehr Familienbeitrag als Person B. Hier sind drei Möglichkeiten das anzugleichen."*

> *"Das Kind hatte diese Woche 3h weniger Elternzeit als üblich. Möchtet ihr das Wochenende anders planen?"*

Nur Vorschläge, keine automatischen Änderungen. Beide müssen Tausch-Requests bestätigen.

---

## Monetarisierung

| Modell | Details |
|---|---|
| **Free** | 2 Personen, 1 Kind, 4 Wochen Verlauf, iCal-Export |
| **Family (4,99€/Mo)** | Mehrere Kinder, unbegrenzte Historie, Tausch-Requests |
| **Premium (9,99€/Mo)** | Finanzmodul, KI-Assistent, Szenarienvergleich, Extern-Zugang |

---

## Differenzierung

| Wettbewerb | Schwäche | Family-Planner-Vorteil |
|---|---|---|
| Google Calendar | Keine Fairness-Analyse | Bedürfnis/Wunsch-Ebene, Familienbilanz |
| Cozi / FamCal | Nur Termine, kein P2P | GunDB: eigener Relay, volle Datenkontrolle |
| Spreadsheets | Statisch, kein Sync | Kollaborativ, live, offline-fähig |
| Andere Apps | Zentraler Server, Datenschutzrisiko | Dezentral, Ende-zu-Ende verschlüsselt |
