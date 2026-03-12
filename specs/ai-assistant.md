# KI-Assistent

Ein sanfter Vorschlagsmodus als Agent auf dem Relay-Server.

## Funktionsweise

Der Client serialisiert den aktuellen Familienplan aus GunDB als Klartext und schickt ihn an den Relay-Server. Der KI-Agent analysiert den Plan und gibt Vorschläge als Text zurück. Keine Datenspeicherung serverseitig – der Kontext lebt ausschließlich in GunDB auf den Geräten der Familie.

## Beispiel-Interaktionen

> *"Person Bs Wunsch Yoga Sa 9–10h ist diese Woche noch nicht gedeckt. Person A hat Sa 8–10h frei. Soll ich einen Tausch vorschlagen?"*

> *"Diese Woche trägt Person A 12h mehr Familienbeitrag als Person B. Hier sind drei Möglichkeiten das anzugleichen."*

> *"Das Kind hatte diese Woche 3h weniger Elternzeit als üblich. Möchtet ihr das Wochenende anders planen?"*

## Prinzipien

- Nur Vorschläge, keine automatischen Änderungen
- Beide müssen Tausch-Requests bestätigen
- Kein serverseitiger Zustand – jede Anfrage enthält den vollständigen Kontext
