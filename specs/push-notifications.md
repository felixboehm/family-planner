# Push-Benachrichtigungen

## Auslöser

Web Push Notifications bei:
- Planänderungen durch den Partner
- Offenen Tausch-Requests
- Betreuungslücken

## Technische Umsetzung

Über die Web Push API: Der Relay-Server hält VAPID-Keys und sendet Push-Messages an registrierte Service Worker. GunDB-Listener auf dem Server triggern Notifications bei relevanten Datenänderungen.
