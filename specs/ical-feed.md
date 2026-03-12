# iCal-Feed

Jede Person kann ihren persönlichen Kalender als `.ics`-Datei exportieren oder als **Live-Feed abonnieren**.

## Feed-Typen

- **Einzelperson:** Nur eigene Termine + zugewiesene Betreuungsslots
- **Familie:** Alle Termine aller Mitglieder zusammen
- **Kind:** Tagesstruktur + Betreuungszeiten

## Einmal-Export

Wird direkt im Browser aus GunDB generiert – kein Server beteiligt. Nutzer lädt eine `.ics`-Datei herunter.

## Live-Feed (Abo)

Wird über den Relay-Server bereitgestellt. Der Server liest die Familiendaten aus GunDB und generiert den `.ics`-Feed on-the-fly. Kalender-Apps (Google Calendar, Apple Calendar, Outlook) pollen diesen Endpunkt periodisch.

Kompatibel mit allen standard-konformen Kalenderanwendungen.
