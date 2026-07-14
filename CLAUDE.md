# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Canta Aí — hosted karaoke app (Next.js 15 App Router + React 19 + Supabase), deployed on Vercel. UI text, comments, and docs are in Brazilian Portuguese; keep new user-facing text and comments in pt-BR.

Three screens, one event flow:
- `/entrar` — guests (via QR code on their phones) pick a name + song and join the queue.
- `/admin` — host panel (password-protected): register songs (mp3 + LRC + style) and background videos (mp4 + style), manage the queue, show the QR code.
- `/palco` — the event TV: plays audio + background video, shows synced lyrics, scores singing via microphone pitch detection, previews upcoming queue.

## Commands

- `npm run dev` — dev server at http://localhost:3000 (also defined as `canta-ai` in `.claude/launch.json`)
- `npm run build` — production build (also the de-facto type check)
- `npx tsc --noEmit` — type check only

There are no tests and no linter configured.

Local setup requires `.env.local` (copy from `.env.local.example`) with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, and a Supabase project with `supabase/schema.sql` applied (creates tables + public `midia` storage bucket).

## Architecture

### Data access: everything goes through the server

RLS is enabled on all tables **with no policies**, so the anon key cannot touch the database. All reads/writes go through Next.js route handlers in `src/app/api/`, which use the service-role client from `src/lib/supabase-server.ts` (`supabaseAdmin()` — server-only, never import into client code). Client pages call these routes through the `api()` helper in `src/lib/client-api.ts`.

The one exception is file upload: `uploadMedia()` in `client-api.ts` uploads mp3/mp4 **directly from the browser to Supabase Storage** using a signed upload URL minted by `POST /api/upload-url`. This is deliberate — Vercel functions cap request bodies at ~4.5MB, so media must not pass through the server. Media playback uses public bucket URLs built by `mediaUrl()` in `src/lib/types.ts`.

### Admin auth

Single-password model (`ADMIN_PASSWORD` env var), implemented in `src/lib/auth.ts`: the session cookie value is a SHA-256 digest derived from the password, verified with `isAdmin()` (timing-safe). Every write route calls `isAdmin()` first — **except** `POST /api/queue`, which is intentionally public (guests joining the queue). `POST /api/auth` sets the cookie.

### Queue lifecycle

`queue.status`: `waiting` → `performing` (via `POST /api/queue/:id/call`) → `done` (via `POST /api/queue/:id/done`). `GET /api/queue` returns only `waiting` + `performing` rows, joined with the song. There is no realtime/WebSocket layer: `/admin` and `/palco` poll every few seconds by design (see `arquitetura-hospedagem.md` §1).

### Karaoke engine (`src/karaoke/`)

LRC parsing (`lrc.ts`), pitch detection by autocorrelation + line scoring (`pitch.ts`), and toast/grade messages (`messages.ts`) were ported verbatim from the single-file prototype `prototype-karaoke.html` — the algorithms are intentionally unchanged, and file headers say so. Everything runs client-side in `/palco`; the backend only persists songs/videos/queue. If asked to change scoring or sync behavior, treat the prototype parity as the reference point.

### Background video selection

Songs and background videos each have a free-text `style` (suggested list in `SUGGESTED_STYLES`, `src/lib/types.ts`). `/palco` picks a random video matching the song's style, falling back to a random pick among **all** videos when the style has none. Few reusable videos per style (not one per song) is a deliberate constraint of the Supabase free tier's 1GB storage.

### Reference docs

`arquitetura-hospedagem.md` is the architecture plan the code follows (stack choices, API surface, free-tier limits). `prototype-karaoke.html` is the original single-file prototype kept as reference — don't edit it.

## Caveat: duplicate `canta_ai/` directory

The untracked `canta_ai/` directory is a stale byte-for-byte copy of the whole project. The real app is at the repo root (`src/`, `supabase/`, etc.). Never edit files under `canta_ai/`.
