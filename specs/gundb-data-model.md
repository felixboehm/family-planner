# GunDB Datenmodell & Sharing

## Status quo

Familiendaten liegen aktuell unter einem öffentlichen Pfad `families/{uuid}/` im globalen GunDB-Graphen. Jeder mit der UUID kann lesen und schreiben. Keine Verschlüsselung, keine Zugriffskontrolle.

`familyId` und `memberId` werden im GunDB User-Space (`gun.user()`) des jeweiligen Nutzers gespeichert.

### Probleme

- **Keine Zugriffskontrolle** – jeder der die UUID kennt kann Daten lesen/schreiben
- **Keine Verschlüsselung** – Daten liegen im Klartext auf dem Relay
- **Kein echtes Sharing** – Partner müssen die Family-UUID manuell austauschen
- **Kein Ownership** – es gibt keinen "Besitzer" der Familie

## Zielarchitektur: Familie als SEA User

Eine Familie wird als eigener GunDB SEA User modelliert. Das Family-Keypair wird mit allen Mitgliedern geteilt. Daten liegen verschlüsselt im User-Space der Familie.

### Konzept

```
Familie = SEA Keypair (pub + priv)
  └── gun.user(familyPub)
        ├── members/{pubKey}     → Profildaten
        ├── events/{eventId}     → Termine
        ├── children/{childId}   → Kind-Profile
        │     └── slots/{slotId} → Betreuungsslots
        ├── requests/{reqId}     → Tausch-Requests
        ├── categories/{catId}   → Kategorien
        ├── finance/             → Finanzdaten
        └── certs/{pubKey}       → Schreibzertifikate
```

### Ablauf: Familie erstellen

1. Ersteller generiert ein SEA-Keypair für die Familie: `const familyPair = await SEA.pair()`
2. Ersteller speichert das verschlüsselte Family-Keypair in seinem User-Space: `gun.user().get('family').put(await SEA.encrypt(familyPair, userPair))`
3. Ersteller authentifiziert sich als Familie: `gun.user().auth(familyPair)`
4. Ersteller schreibt initiale Daten (Name, Kategorien) in den Family-User-Space
5. Ersteller erstellt ein Zertifikat für sich selbst: `await SEA.certify(userPub, [{ '*': 'events', '+': '*' }, { '*': 'requests', '+': '*' }, ...], familyPair)`

### Ablauf: Partner einladen

1. Ersteller generiert einen Einladungslink mit dem verschlüsselten Family-Keypair
2. Verschlüsselung via Diffie-Hellman: `await SEA.encrypt(familyPair, await SEA.secret(partnerEpub, creatorPair))`
3. Alternativ: Einladungscode (zeitlich begrenzt) über einen shared secret
4. Partner entschlüsselt das Family-Keypair und speichert es in seinem User-Space
5. Ersteller erstellt ein Schreibzertifikat für den Partner

### Ablauf: Daten lesen/schreiben

**Lesen:** Jedes Mitglied kennt `familyPair.pub` und kann `gun.user(familyPub)` lesen.

**Schreiben:** Mitglieder nutzen ihr Zertifikat:
```js
gun.user(familyPub)
  .get('events')
  .get(eventId)
  .put(eventData, null, { opt: { cert: myCertificate } })
```

**Verschlüsselt schreiben:** Sensible Daten (Finanzen) können zusätzlich mit dem Family-Keypair verschlüsselt werden:
```js
const encrypted = await SEA.encrypt(data, familyPair)
gun.user(familyPub).get('finance').get('incomes').get(id).put(encrypted)
```

### Ablauf: Daten im eigenen User-Space

Jeder Nutzer speichert in `gun.user()`:
- `family` → verschlüsseltes Family-Keypair (mit eigenem Keypair verschlüsselt)
- `familyCert` → eigenes Schreibzertifikat für die Familie
- `familyPub` → Public Key der Familie (für schnellen Lookup)

### Einladungsflow (UX)

1. Ersteller klickt "Partner einladen"
2. App generiert einen kurzen Code (z.B. 6 Zeichen) oder QR-Code
3. Code wird zusammen mit dem verschlüsselten Family-Keypair temporär unter einem öffentlichen Pfad gespeichert: `gun.get('invites').get(code).put(encryptedPayload)`
4. Partner gibt Code ein → App entschlüsselt das Keypair → Familie beigetreten
5. Einladung wird nach Einlösung oder nach 24h gelöscht

### Auswirkungen auf den Relay-Server

Der Server muss die Familiendaten lesen können (für iCal, Push, KI). Optionen:

1. **Server als Familienmitglied** – bekommt ein eigenes Zertifikat und das Family-Keypair (verschlüsselt mit Server-Key)
2. **Selektives Teilen** – nur die für iCal/Push relevanten Nodes werden unverschlüsselt oder mit einem Server-Shared-Secret geteilt
3. **Client generiert Daten** – iCal-Export nur clientseitig, Push nur bei offener App

Option 1 ist am einfachsten. Der Server wird beim Erstellen der Familie automatisch als "stilles Mitglied" hinzugefügt.

### Migration

Der Umbau betrifft alle Composables die GunDB nutzen:
- `useAuth` – bleibt (persönlicher User)
- `useFamily` – liest/schreibt auf `gun.user(familyPub)` statt `gun.get('families').get(id)`
- `useEvents`, `useChildren`, `useCategories`, `useRequests`, `useFinance` – Pfade ändern sich, Schreiboperationen brauchen Zertifikate
- Server – iCal/Push Listener müssen auf `gun.user(familyPub)` subscriben

### Vorteile

- **Echte Zugriffskontrolle** – nur Mitglieder mit Keypair können lesen
- **Verschlüsselung** – Daten sind Ende-zu-Ende verschlüsselt
- **Kein UUID-Sharing** – Einladung per Code/QR
- **GunDB-nativ** – nutzt SEA wie vorgesehen
- **Revokable** – Zertifikate können ablaufen oder widerrufen werden

## Migrationsplan

Der Umbau von öffentlichen Pfaden auf SEA User Space erfolgt in 5 aufeinander aufbauenden PRs:

### PR 1: SEA Helpers + Types

- Neue Datei `client/src/lib/sea.ts` mit Hilfsfunktionen für SEA-Operationen (Keypair-Generierung, Verschlüsselung, Zertifikaterstellung)
- TypeScript-Typen für `FamilyPair`, `Certificate`, `InvitePayload`
- Unit-Tests für alle SEA-Hilfsfunktionen

### PR 2: `useFamily` Rewrite

- `useFamily` Composable auf `gun.user(familyPub)` umstellen
- Familie erstellen: SEA-Keypair generieren, User-Space initialisieren, Zertifikat für Ersteller ausstellen
- Familie laden: verschlüsseltes Keypair aus eigenem User-Space lesen und entschlüsseln
- Server automatisch als stilles Mitglied hinzufügen

### PR 3: Invite-Flow

- Neue Datei `client/src/composables/useInvite.ts`
- Einladungscode generieren, Family-Keypair verschlüsselt unter `gun.get('invites').get(code)` ablegen
- Einladung einlösen: Keypair entschlüsseln, im eigenen User-Space speichern
- Schreibzertifikat für neues Mitglied erstellen
- Ablauf nach 24h, Cleanup

### PR 4: Data Composables Migration

- `useEvents`, `useChildren`, `useCategories`, `useRequests`, `useFinance` auf `gun.user(familyPub)` umstellen
- Alle Schreiboperationen um Zertifikat-Parameter erweitern (`{ opt: { cert } }`)
- Finance-Daten zusätzlich mit `SEA.encrypt()` / `SEA.decrypt()` verschlüsseln
- Bestehende Tests anpassen

### PR 5: Server Migration

- Neue Datei `server/src/lib/serverIdentity.ts` – persistentes Server-Keypair generieren und laden
- iCal-, Push- und KI-Listener auf `gun.user(familyPub)` umstellen
- Server authentifiziert sich mit eigenem Keypair und nutzt sein Zertifikat für Schreibzugriff
- Verschlüsselte Daten mit dem Family-Keypair entschlüsseln
