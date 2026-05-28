# Sportstar FIFA World Cup 2026 — Bracket Challenge

This is a **standalone Next.js 16 project**. Do not read from or write to any sibling folder
(e.g. `ss_world_cricket_index-main`).

## Stack
- **Framework:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **State:** Zustand with localStorage persistence (`lib/store.ts`)
- **Icons:** Lucide React
- **Run:** `./node_modules/.bin/next dev` (next is not globally installed)

## Key files
| File | Purpose |
|---|---|
| `data/teams.ts` | 48 FIFA WC 2026 teams with group assignments |
| `data/bracket.ts` | Slot graph (R32→R16→QF→SF→Final), scoring config, lock timestamp |
| `lib/bracket.ts` | Resolve which team is in a bracket slot given picks |
| `lib/store.ts` | Zustand store — group ranks, knockout picks, tiebreakers |
| `lib/scoring.ts` | Scoring engine (used post-match to award points) |
| `types/index.ts` | All TypeScript interfaces |

## Pages
| Route | Description |
|---|---|
| `/` | Hub / landing page |
| `/build` | Interactive bracket builder (8-step wizard) |
| `/how-to-play` | Rules, scoring table, FAQ |
| `/leaderboard` | Global leaderboard (mock; wire to DB for production) |
| `/b/[code]` | Public bracket view by short code |
| `/terms` | Terms & Conditions |
| `/privacy` | Privacy Policy |

## Design tokens
All custom colors are CSS variables defined in `app/globals.css` under `@theme`:
- `--color-sportstar` (#e8161c) — primary red
- `--color-gold` (#f59e0b) — points / highlights
- `--color-pitch` (#16a34a) — correct picks / advance indicators
- `--color-ink-{950..600}` — dark background palette

## Next steps to production-ready
1. Add a Postgres backend (Supabase recommended) using the schema in `TECH_SPECS.md`
2. Wire the leaderboard page to `GET /api/v1/leaderboard`
3. Replace magic-link stub in auth flow with a real email provider (Postmark/SES)
4. Add the scoring worker (Node process, see `lib/scoring.ts`)
5. Set `LOCK_AT` in `data/bracket.ts` to the confirmed first-match kickoff time
6. Update team group assignments in `data/teams.ts` once the official FIFA draw is published

## Dev commands
```bash
./node_modules/.bin/next dev        # dev server (port 3000)
./node_modules/.bin/next build      # production build
./node_modules/.bin/next start      # serve production build
```
