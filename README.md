# Northbeam Finance

Web-App zum händischen Erfassen von Fixkosten, Ausgaben und Einnahmen —
mit Login und einer Übersicht, die sich automatisch aus deinen Einträgen
berechnet.

Stack: Next.js (App Router) + Supabase (Auth & Postgres) + Tailwind CSS.

## Einrichtung

1. **Supabase-Projekt anlegen**: auf [supabase.com](https://supabase.com)
   ein neues Projekt erstellen.
2. **Datenbank-Schema einspielen**: den Inhalt von
   `supabase/migrations/0001_init.sql` im Supabase SQL-Editor ausführen
   (legt die Tabelle `entries` inkl. Row-Level-Security an).
3. **Umgebungsvariablen setzen**: `.env.local.example` nach `.env.local`
   kopieren und mit den Werten aus *Project Settings → API* füllen
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. **Abhängigkeiten installieren und starten**:

   ```bash
   npm install
   npm run dev
   ```

5. Unter `http://localhost:3000` registrieren (Supabase verlangt je nach
   Projekteinstellung eine Bestätigung per E-Mail) und einloggen.

## Funktionen

- Registrierung/Login per E-Mail & Passwort (Supabase Auth)
- Einträge mit Typ (Einnahme / Ausgabe / Fixkosten), Bezeichnung,
  Kategorie, Betrag und Datum anlegen und löschen
- Übersicht mit Monats-KPIs (Einnahmen, Ausgaben, Fixkosten, Saldo),
  berechnet direkt aus den gespeicherten Einträgen
- Daten sind pro Nutzer:in isoliert (Row Level Security in Postgres)
- Light/Dark-Theme-Umschalter

## Struktur

- `app/dashboard` — geschützter Bereich (Übersicht, Einträge)
- `app/login`, `app/signup` — Auth-Seiten
- `lib/actions.ts` — Server Actions zum Anlegen/Löschen von Einträgen
- `lib/supabase` — Supabase-Clients für Browser, Server und Middleware
- `supabase/migrations` — SQL-Schema
