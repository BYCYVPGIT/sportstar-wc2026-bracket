# Data Pipeline & Live Scoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire football-data.org → Supabase → scoring engine → live leaderboard so brackets are automatically scored as the tournament progresses.

**Architecture:** Vercel Cron calls `/api/cron/sync-results` every 15 minutes; it fetches finished matches from football-data.org, maps them to internal slotCodes by resolving team IDs, upserts `tournament_results`, then rescores every `bracket_submissions` row using the existing `computeFullScore` engine. User submissions fire a fire-and-forget POST to `/api/brackets` after setting localStorage state.

**Tech Stack:** Next.js 16 App Router, @supabase/supabase-js, football-data.org REST API v4, Zustand v5, TypeScript

---

## File Map

**Create:**
- `supabase/schema.sql` — DB schema to run in Supabase SQL editor
- `.env.local.example` — env var template
- `vercel.json` — cron schedule
- `lib/supabase.ts` — server + browser Supabase clients
- `lib/football-data.ts` — API client, TLA→ID mapping, slotCode resolver
- `app/api/brackets/route.ts` — POST: submit bracket
- `app/api/brackets/[code]/route.ts` — GET: fetch bracket by code
- `app/api/leaderboard/route.ts` — GET: ranked leaderboard
- `app/api/cron/sync-results/route.ts` — cron: sync + rescore

**Modify:**
- `lib/scoring.ts` — export `TournamentResults` interface (currently unexported)
- `lib/store.ts` — `submitBracket()` fires POST to `/api/brackets`
- `app/leaderboard/page.tsx` — replace mock data with live fetch
- `app/b/[code]/page.tsx` — fetch bracket from `/api/brackets/[code]`
- `package.json` — add `@supabase/supabase-js`

---

## Task 1: Install dependency + create env template + vercel.json

**Files:**
- Modify: `package.json`
- Create: `.env.local.example`
- Create: `vercel.json`

- [ ] **Step 1: Install @supabase/supabase-js**

Run from `/Users/venkataprasad/Documents/Cursor:Antigravity/Football Bracket/bracket-app`:
```bash
npm install @supabase/supabase-js
```
Expected: package-lock.json updated, `@supabase/supabase-js` appears in `dependencies`.

- [ ] **Step 2: Create `.env.local.example`**

Create file at `bracket-app/.env.local.example`:
```
# Supabase — get these from your project's Settings → API page
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# football-data.org — token from your confirmation email
FOOTBALL_DATA_API_KEY=a2a6da78a2694a018c431ed1d6514692

# Cron protection — generate with: openssl rand -hex 32
CRON_SECRET=replace-with-a-random-string
```

- [ ] **Step 3: Create `vercel.json`**

Create file at `bracket-app/vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-results",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

- [ ] **Step 4: Add `.env.local` to `.gitignore`** (if not already there)

Check `bracket-app/.gitignore`. If `.env.local` is not in it, add a line:
```
.env.local
```

- [ ] **Step 5: Commit**
```bash
git add package.json package-lock.json .env.local.example vercel.json .gitignore
git commit -m "chore: add supabase dep, env template, vercel cron config"
```

---

## Task 2: Supabase database schema

**Files:**
- Create: `supabase/schema.sql`

- [ ] **Step 1: Create `supabase/schema.sql`**

Create file at `bracket-app/supabase/schema.sql`:
```sql
-- ─── bracket_submissions ──────────────────────────────────────────────────────
-- Stores one row per submitted user bracket. Upserted on re-submission.
create table if not exists bracket_submissions (
  short_code     text        primary key,
  display_name   text        not null,
  group_ranks    jsonb       not null default '{}',
  knockout_picks jsonb       not null default '{}',
  tiebreakers    jsonb       not null default '{}',
  score          integer     not null default 0,
  submitted_at   timestamptz not null,
  updated_at     timestamptz not null default now()
);

-- Index used by leaderboard query (score DESC, then submitted_at ASC for tiebreak)
create index if not exists bracket_submissions_score_idx
  on bracket_submissions (score desc, submitted_at asc);

-- ─── tournament_results ───────────────────────────────────────────────────────
-- Singleton row (season = '2026') updated by the cron job after every sync.
-- group_standings: { "A": ["usa","pan","hon","blo"], "B": [...], ... }
-- knockout_results: { "R32-M1": "arg", "R16-M1": "arg", ... }
create table if not exists tournament_results (
  season             text        primary key default '2026',
  group_standings    jsonb       not null default '{}',
  knockout_results   jsonb       not null default '{}',
  golden_boot_team   text,
  final_total_goals  integer,
  last_synced_at     timestamptz
);

-- Seed the singleton row so the cron can upsert without a prior insert
insert into tournament_results (season)
  values ('2026')
  on conflict do nothing;
```

- [ ] **Step 2: Run in Supabase**

1. Go to your Supabase project dashboard → **SQL Editor**
2. Paste the contents of `supabase/schema.sql` and click **Run**
3. Verify: in **Table Editor** you see `bracket_submissions` and `tournament_results`
4. Verify: `tournament_results` has one row with `season = '2026'`

- [ ] **Step 3: Commit**
```bash
git add supabase/schema.sql
git commit -m "feat: add supabase schema for bracket submissions and tournament results"
```

---

## Task 3: Supabase client module

**Files:**
- Create: `lib/supabase.ts`

- [ ] **Step 1: Create `lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client.
 * Uses the service role key — bypasses RLS.
 * NEVER import this in client components or expose to the browser.
 */
export function createServerClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Browser-safe Supabase client.
 * Uses the anon key — subject to Row Level Security.
 * Safe to import in client components.
 */
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**
```bash
cd "/Users/venkataprasad/Documents/Cursor:Antigravity/Football Bracket/bracket-app"
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors referencing `lib/supabase.ts`.

- [ ] **Step 3: Commit**
```bash
git add lib/supabase.ts
git commit -m "feat: add supabase client module (server + browser)"
```

---

## Task 4: football-data.org client + slotCode resolver

**Files:**
- Create: `lib/football-data.ts`

This module has three responsibilities:
1. `fetchFinishedMatches()` — calls football-data.org, returns knockout matches mapped to internal team IDs
2. `fetchGroupStandings()` — calls football-data.org, returns group tables mapped to internal team IDs
3. `resolveSlotCode()` — pure function that finds which internal slotCode a real-world match corresponds to

- [ ] **Step 1: Create `lib/football-data.ts`**

```typescript
/**
 * football-data.org API client for FIFA WC 2026.
 * Handles HTTP, maps external IDs to internal team IDs, and resolves
 * real-world match results to our internal slotCode graph.
 */
import type { GroupCode, GroupRanks, KnockoutPicks } from '@/types';
import { ALL_SLOTS } from '@/data/bracket';
import { resolveMatchTeams } from '@/lib/bracket';

const BASE_URL     = 'https://api.football-data.org/v4';
const COMPETITION  = 2000; // FIFA World Cup (same ID reused each edition)

// ─── Team ID mapping ──────────────────────────────────────────────────────────
// Maps football-data.org 3-letter codes (tla) → our internal team IDs
export const TLA_TO_TEAM_ID: Record<string, string> = {
  USA: 'usa', PAN: 'pan', HON: 'hon', BOL: 'blo',
  ARG: 'arg', CHI: 'chi', PER: 'per', NZL: 'nzl',
  MEX: 'mex', CRC: 'crc', VEN: 'ven', JAM: 'jam',
  CAN: 'can', COL: 'col', ECU: 'ecu', URU: 'uru',
  GER: 'ger', TUR: 'tur', AUT: 'aut', KAZ: 'kaz',
  ESP: 'esp', SRB: 'srb', NED: 'ned', CIV: 'civ',
  POR: 'por', CRO: 'cro', DEN: 'den', MAR: 'mar',
  FRA: 'fra', POL: 'pol', BEL: 'bel', SEN: 'sen',
  ENG: 'eng', SCO: 'sco', NGA: 'ngr', TUN: 'tun',
  BRA: 'bra', PAR: 'mex2', CMR: 'caf1', KSA: 'ksa',
  JPN: 'jpn', KOR: 'kor', ITA: 'ita', EGY: 'afr1',
  AUS: 'aus', IRN: 'ira', UZB: 'uzb', RSA: 'afr2',
};

// ─── Stage mapping ────────────────────────────────────────────────────────────
// Maps football-data.org stage strings → our internal Stage type
const FDORG_STAGE: Record<string, string> = {
  LAST_32:                    'r32',
  LAST_16:                    'r16',
  QUARTER_FINALS:             'qf',
  SEMI_FINALS:                'sf',
  FINAL:                      'final',
  THIRD_PLACE:                'third',
  PLAY_OFF_FOR_THIRD_PLACE:   'third',
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FinishedMatch {
  homeTeamId: string;
  awayTeamId: string;
  winnerId:   string;
  stage:      string; // internal stage: 'r32' | 'r16' | 'qf' | 'sf' | 'final' | 'third'
}

export type GroupStandings = Partial<Record<GroupCode, [string, string, string, string]>>;

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function fdFetch(path: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`football-data.org ${path} responded ${res.status}`);
  }
  return res.json();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns all FINISHED knockout matches for WC 2026 with internal team IDs.
 * Group-stage matches are excluded (no slotCode mapping needed for them).
 */
export async function fetchFinishedMatches(): Promise<FinishedMatch[]> {
  const data = (await fdFetch(
    `/competitions/${COMPETITION}/matches?status=FINISHED`,
  )) as { matches?: Array<{
    stage: string;
    homeTeam: { tla: string };
    awayTeam: { tla: string };
    score: { winner: string | null };
  }> };

  const result: FinishedMatch[] = [];

  for (const m of data.matches ?? []) {
    const stage = FDORG_STAGE[m.stage];
    if (!stage) continue; // unknown or group stage

    const homeId = TLA_TO_TEAM_ID[m.homeTeam?.tla ?? ''];
    const awayId = TLA_TO_TEAM_ID[m.awayTeam?.tla ?? ''];
    if (!homeId || !awayId) continue; // unknown team

    let winnerId: string | null = null;
    if (m.score?.winner === 'HOME_TEAM') winnerId = homeId;
    else if (m.score?.winner === 'AWAY_TEAM') winnerId = awayId;
    if (!winnerId) continue; // match not yet decided (e.g. DRAW in group)

    result.push({ homeTeamId: homeId, awayTeamId: awayId, winnerId, stage });
  }

  return result;
}

/**
 * Returns the official group standings for WC 2026 mapped to internal team IDs.
 * Returns an empty object before the group stage completes.
 */
export async function fetchGroupStandings(): Promise<GroupStandings> {
  const data = (await fdFetch(
    `/competitions/${COMPETITION}/standings`,
  )) as { standings?: Array<{
    type:  string;
    group: string;
    table: Array<{ position: number; team: { tla: string } }>;
  }> };

  const result: GroupStandings = {};

  for (const standing of data.standings ?? []) {
    if (standing.type !== 'TOTAL') continue;
    // football-data.org: "GROUP_A" → we need "A"
    const groupCode = standing.group?.replace('GROUP_', '') as GroupCode | undefined;
    if (!groupCode) continue;

    const sorted = [...(standing.table ?? [])].sort((a, b) => a.position - b.position);
    const ids = sorted
      .slice(0, 4)
      .map(row => TLA_TO_TEAM_ID[row.team?.tla ?? ''])
      .filter((id): id is string => Boolean(id));

    if (ids.length === 4) {
      result[groupCode] = ids as [string, string, string, string];
    }
  }

  return result;
}

/**
 * Given a finished match and the current tournament state, finds which
 * internal slotCode this match corresponds to.
 *
 * Strategy: iterate slots of the matching stage, resolve each slot's two
 * teams using groupStandings + already-known knockoutResults, and find the
 * slot whose teams match the match's teams.
 *
 * Returns null if no slot matches (e.g. group standings not yet available).
 */
export function resolveSlotCode(
  match: FinishedMatch,
  groupStandings: GroupStandings,
  currentKnockoutResults: Record<string, string>,
): string | null {
  const stageSlots = ALL_SLOTS.filter(s => s.stage === match.stage);

  for (const slot of stageSlots) {
    const [home, away] = resolveMatchTeams(
      slot.slotCode,
      groupStandings as GroupRanks,
      currentKnockoutResults as KnockoutPicks,
    );
    if (!home || !away) continue;

    const teamsMatch =
      (home === match.homeTeamId && away === match.awayTeamId) ||
      (home === match.awayTeamId && away === match.homeTeamId);

    if (teamsMatch) return slot.slotCode;
  }

  return null;
}
```

- [ ] **Step 2: Verify TypeScript compiles**
```bash
cd "/Users/venkataprasad/Documents/Cursor:Antigravity/Football Bracket/bracket-app"
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors referencing `lib/football-data.ts`.

- [ ] **Step 3: Commit**
```bash
git add lib/football-data.ts
git commit -m "feat: add football-data.org API client with slotCode resolver"
```

---

## Task 5: Export TournamentResults type from lib/scoring.ts

**Files:**
- Modify: `lib/scoring.ts`

The cron route imports `computeFullScore` and needs to pass a `TournamentResults`-shaped object. Currently the interface is unexported.

- [ ] **Step 1: Export TournamentResults from `lib/scoring.ts`**

Find this block at the top of `lib/scoring.ts`:
```typescript
interface TournamentResults {
  groupStandings: Partial<Record<GroupCode, [string, string, string, string]>>;
  knockoutResults: Record<string, string>;  // slotCode → winner teamId
  goldenBootTeam?: string;
  finalTotalGoals?: number;
}
```

Change `interface` to `export interface`:
```typescript
export interface TournamentResults {
  groupStandings: Partial<Record<GroupCode, [string, string, string, string]>>;
  knockoutResults: Record<string, string>;  // slotCode → winner teamId
  goldenBootTeam?: string;
  finalTotalGoals?: number;
}
```

- [ ] **Step 2: Verify TypeScript compiles**
```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

- [ ] **Step 3: Commit**
```bash
git add lib/scoring.ts
git commit -m "feat: export TournamentResults interface for use in API routes"
```

---

## Task 6: POST /api/brackets — submit bracket endpoint

**Files:**
- Create: `app/api/brackets/route.ts`

- [ ] **Step 1: Create `app/api/brackets/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { computeFullScore } from '@/lib/scoring';
import type { GroupRanks, KnockoutPicks, Tiebreakers } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      shortCode:    string;
      displayName:  string;
      groupRanks:   GroupRanks;
      knockoutPicks: KnockoutPicks;
      tiebreakers:  Tiebreakers;
      submittedAt:  string;
    };

    const { shortCode, displayName, groupRanks, knockoutPicks, tiebreakers, submittedAt } = body;

    if (!shortCode?.trim() || !displayName?.trim()) {
      return NextResponse.json({ error: 'shortCode and displayName are required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Fetch current tournament results to compute an initial score
    const { data: results } = await supabase
      .from('tournament_results')
      .select('group_standings, knockout_results, golden_boot_team, final_total_goals')
      .eq('season', '2026')
      .single();

    const score = computeFullScore(
      groupRanks   ?? {},
      knockoutPicks ?? {},
      tiebreakers  ?? { goldenBootTeam: '', finalTotalGoals: 5 },
      {
        groupStandings:  (results?.group_standings  ?? {}) as any,
        knockoutResults: (results?.knockout_results ?? {}) as Record<string, string>,
        goldenBootTeam:  results?.golden_boot_team  ?? undefined,
        finalTotalGoals: results?.final_total_goals ?? undefined,
      },
    ).total;

    const { error } = await supabase.from('bracket_submissions').upsert(
      {
        short_code:    shortCode,
        display_name:  displayName,
        group_ranks:   groupRanks,
        knockout_picks: knockoutPicks,
        tiebreakers,
        score,
        submitted_at:  submittedAt,
        updated_at:    new Date().toISOString(),
      },
      { onConflict: 'short_code' },
    );

    if (error) {
      console.error('[POST /api/brackets]', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ shortCode, score });
  } catch (err) {
    console.error('[POST /api/brackets]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**
```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**
```bash
git add app/api/brackets/route.ts
git commit -m "feat: add POST /api/brackets endpoint for bracket submission"
```

---

## Task 7: GET /api/brackets/[code] — fetch bracket by code

**Files:**
- Create: `app/api/brackets/[code]/route.ts`

- [ ] **Step 1: Create `app/api/brackets/[code]/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  if (!code?.trim()) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('bracket_submissions')
    .select('short_code, display_name, group_ranks, knockout_picks, tiebreakers, score, submitted_at')
    .eq('short_code', code)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Bracket not found' }, { status: 404 });
  }

  return NextResponse.json({
    shortCode:    data.short_code,
    displayName:  data.display_name,
    groupRanks:   data.group_ranks,
    knockoutPicks: data.knockout_picks,
    tiebreakers:  data.tiebreakers,
    score:        data.score,
    submittedAt:  data.submitted_at,
  });
}
```

- [ ] **Step 2: Verify TypeScript compiles**
```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**
```bash
git add "app/api/brackets/[code]/route.ts"
git commit -m "feat: add GET /api/brackets/[code] endpoint"
```

---

## Task 8: GET /api/leaderboard — ranked leaderboard endpoint

**Files:**
- Create: `app/api/leaderboard/route.ts`

- [ ] **Step 1: Create `app/api/leaderboard/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { LeaderboardEntry } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit  = Math.min(Number(searchParams.get('limit')  ?? '50'), 100);
  const offset = Math.max(Number(searchParams.get('offset') ?? '0'),  0);

  const supabase = createServerClient();

  const { data, count, error } = await supabase
    .from('bracket_submissions')
    .select('short_code, display_name, score, submitted_at', { count: 'exact' })
    .order('score',        { ascending: false })
    .order('submitted_at', { ascending: true }) // tiebreak: earlier submission ranks higher
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[GET /api/leaderboard]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  const total = count ?? 0;

  const entries: LeaderboardEntry[] = (data ?? []).map((row, i) => {
    const rank = offset + i + 1;
    // percentile: what % of players this bracket beats
    const percentile = total > 1
      ? Math.round(((total - rank) / (total - 1)) * 100 * 10) / 10
      : 100;

    return {
      rank,
      displayName: row.display_name,
      shortCode:   row.short_code,
      score:       row.score,
      percentile,
      submittedAt: row.submitted_at,
    };
  });

  return NextResponse.json({ entries, total });
}
```

- [ ] **Step 2: Verify TypeScript compiles**
```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**
```bash
git add app/api/leaderboard/route.ts
git commit -m "feat: add GET /api/leaderboard endpoint with pagination"
```

---

## Task 9: GET /api/cron/sync-results — the core automation

**Files:**
- Create: `app/api/cron/sync-results/route.ts`

This is the main automation. It:
1. Verifies the CRON_SECRET header
2. Fetches finished matches + group standings from football-data.org
3. Resolves each match to a slotCode (processing earlier rounds first so later rounds can resolve)
4. Upserts `tournament_results`
5. Rescores every bracket and batch-updates scores

- [ ] **Step 1: Create `app/api/cron/sync-results/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  fetchFinishedMatches,
  fetchGroupStandings,
  resolveSlotCode,
} from '@/lib/football-data';
import { computeFullScore } from '@/lib/scoring';

// Required so Next.js doesn't cache this route
export const dynamic = 'force-dynamic';

// Stage processing order — earlier rounds must be resolved before later rounds
const STAGE_ORDER = ['r32', 'r16', 'qf', 'sf', 'final', 'third'];

export async function GET(request: Request) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabase = createServerClient();

  try {
    // ── 1. Fetch from football-data.org ──────────────────────────────────────
    const [finishedMatches, groupStandings] = await Promise.all([
      fetchFinishedMatches(),
      fetchGroupStandings(),
    ]);

    // ── 2. Load existing knockout results from DB ─────────────────────────────
    //      Needed so later-round slots can be resolved using earlier results
    const { data: existing } = await supabase
      .from('tournament_results')
      .select('knockout_results, golden_boot_team, final_total_goals')
      .eq('season', '2026')
      .single();

    const knockoutResults: Record<string, string> = {
      ...(existing?.knockout_results ?? {}),
    };

    // ── 3. Resolve each match → slotCode ─────────────────────────────────────
    //      Sort by stage order so R32 results are recorded before R16 resolution
    const sorted = [...finishedMatches].sort(
      (a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage),
    );

    let matchesProcessed = 0;
    for (const match of sorted) {
      const slotCode = resolveSlotCode(match, groupStandings, knockoutResults);
      if (slotCode) {
        knockoutResults[slotCode] = match.winnerId;
        matchesProcessed++;
      }
    }

    // ── 4. Upsert tournament_results ─────────────────────────────────────────
    const { error: upsertErr } = await supabase
      .from('tournament_results')
      .upsert({
        season:            '2026',
        group_standings:   groupStandings,
        knockout_results:  knockoutResults,
        golden_boot_team:  existing?.golden_boot_team  ?? null,
        final_total_goals: existing?.final_total_goals ?? null,
        last_synced_at:    new Date().toISOString(),
      });

    if (upsertErr) throw upsertErr;

    // ── 5. Rescore all brackets ───────────────────────────────────────────────
    const { data: brackets, error: fetchErr } = await supabase
      .from('bracket_submissions')
      .select('short_code, group_ranks, knockout_picks, tiebreakers');

    if (fetchErr) throw fetchErr;

    const now = new Date().toISOString();

    const updates = (brackets ?? []).map(b => ({
      short_code: b.short_code,
      score: computeFullScore(
        b.group_ranks   ?? {},
        b.knockout_picks ?? {},
        b.tiebreakers   ?? { goldenBootTeam: '', finalTotalGoals: 5 },
        {
          groupStandings:  groupStandings as any,
          knockoutResults,
          goldenBootTeam:  existing?.golden_boot_team  ?? undefined,
          finalTotalGoals: existing?.final_total_goals ?? undefined,
        },
      ).total,
      updated_at: now,
    }));

    if (updates.length > 0) {
      const { error: scoreErr } = await supabase
        .from('bracket_submissions')
        .upsert(updates, { onConflict: 'short_code' });
      if (scoreErr) throw scoreErr;
    }

    return NextResponse.json({
      synced:           true,
      matchesProcessed,
      bracketsRescored: updates.length,
      lastSync:         now,
    });

  } catch (err) {
    console.error('[cron/sync-results]', err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**
```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**
```bash
git add app/api/cron/sync-results/route.ts
git commit -m "feat: add cron sync-results endpoint (football-data.org → Supabase → scoring)"
```

---

## Task 10: Update lib/store.ts — fire POST on bracket submit

**Files:**
- Modify: `lib/store.ts` lines ~117-122

The existing `submitBracket` uses `set(state => ...)`. We need access to state values before calling `set`, so we switch to `get()` then `set()`.

- [ ] **Step 1: Replace `submitBracket` in `lib/store.ts`**

Find the existing `submitBracket` action:
```typescript
      submitBracket: () =>
        set(state => ({
          status: 'submitted',
          submittedAt: new Date().toISOString(),
          shortCode: state.shortCode ?? generateShortCode(),
        })),
```

Replace it with:
```typescript
      submitBracket: () => {
        const state      = get();
        const shortCode  = state.shortCode ?? generateShortCode();
        const submittedAt = new Date().toISOString();

        // Update local state immediately — localStorage is source of truth
        set({ status: 'submitted', submittedAt, shortCode });

        // Fire-and-forget: sync bracket to Supabase for scoring + leaderboard
        fetch('/api/brackets', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shortCode,
            displayName:   state.displayName,
            groupRanks:    state.groupRanks,
            knockoutPicks: state.knockoutPicks,
            tiebreakers:   state.tiebreakers,
            submittedAt,
          }),
        }).catch(err => console.error('[bracket:submit]', err));
      },
```

- [ ] **Step 2: Verify TypeScript compiles**
```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**
```bash
git add lib/store.ts
git commit -m "feat: submitBracket fires POST to /api/brackets for Supabase persistence"
```

---

## Task 11: Update leaderboard page — replace mock data with live fetch

**Files:**
- Modify: `app/leaderboard/page.tsx`

Replace the entire file. The page becomes a dynamic Server Component (revalidates every 60s). `MOCK_ROWS` is removed. It fetches from `/api/leaderboard`.

- [ ] **Step 1: Replace `app/leaderboard/page.tsx`**

```typescript
import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Trophy, ExternalLink } from 'lucide-react';
import type { LeaderboardEntry } from '@/types';

export const revalidate = 60; // refresh every 60 seconds

export const metadata: Metadata = {
  title: 'Leaderboard — Sportstar WC 2026 Bracket',
};

async function getLeaderboard(): Promise<{ entries: LeaderboardEntry[]; total: number }> {
  try {
    // Use absolute URL for server-side fetch in Next.js
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3031';
    const res = await fetch(`${base}/api/leaderboard?limit=50`, { next: { revalidate: 60 } });
    if (!res.ok) return { entries: [], total: 0 };
    return res.json();
  } catch {
    return { entries: [], total: 0 };
  }
}

const STAGES = [
  { label: 'Group Stage',    note: 'Begins 11 Jun' },
  { label: 'Round of 32',    note: 'From 29 Jun' },
  { label: 'Round of 16',    note: 'From 5 Jul' },
  { label: 'Quarter-finals', note: 'From 9 Jul' },
  { label: 'Semi-finals',    note: 'From 14 Jul' },
  { label: 'Final',          note: '19 Jul' },
];

export default async function LeaderboardPage() {
  const { entries, total } = await getLeaderboard();
  const pretournament = entries.length === 0;

  return (
    <>
      <Header />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-sportstar-text)] mb-1">
              Sportstar · WC 2026
            </p>
            <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)]">Leaderboard</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Updated after every completed match · {total > 0 ? `${total.toLocaleString()} submissions` : 'Pre-tournament preview'}
            </p>
          </div>
          <Link
            href="/build"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold
                       bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)] hover:bg-[var(--color-sportstar-dim)] transition-colors shrink-0"
          >
            <Trophy className="h-4 w-4" /> Enter your bracket
          </Link>
        </div>

        {/* Pre-tournament banner */}
        {pretournament && (
          <div className="rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5
                          p-4 mb-8 text-sm text-[var(--color-gold)]">
            🏆 The tournament hasn&apos;t started yet — submit your bracket now to appear here.
            The leaderboard goes live after the first match on <strong>11 June 2026</strong>.
          </div>
        )}

        {/* Tournament progress */}
        <section className="mb-8">
          <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-3">Tournament progress</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {STAGES.map(s => (
              <div key={s.label}
                className="rounded-lg border border-[var(--color-line)] bg-[var(--color-ink-800)] p-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-1">{s.label}</p>
                <p className="text-lg font-bold text-[var(--color-text-muted)] tabular-nums">—</p>
                <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">{s.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Table */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">Top brackets</h2>
            <span className="text-xs text-[var(--color-text-muted)]">
              {total > 0 ? `Showing top 50 of ${total.toLocaleString()}` : '0 submissions'}
            </span>
          </div>

          <div className="rounded-xl border border-[var(--color-line)] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[3rem_1fr_auto_auto] sm:grid-cols-[3rem_1fr_auto_auto_auto]
                            gap-x-4 px-4 py-2.5 bg-[var(--color-ink-800)] border-b border-[var(--color-line)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Rank</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Player</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] text-right">Score</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] text-right hidden sm:block">%ile</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] hidden sm:block"></span>
            </div>

            {/* Rows */}
            {entries.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-[var(--color-text-muted)]">
                No submissions yet. Be the first to enter!
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-line-dim)]">
                {entries.map((row, i) => (
                  <div
                    key={row.shortCode}
                    className={[
                      'grid grid-cols-[3rem_1fr_auto_auto] sm:grid-cols-[3rem_1fr_auto_auto_auto]',
                      'gap-x-4 px-4 py-3 items-center hover:bg-[var(--color-ink-700)] transition-colors',
                      i === 0 ? 'bg-[var(--color-gold)]/5' : '',
                    ].join(' ')}
                  >
                    <span className={[
                      'font-bold tabular-nums text-sm',
                      i === 0 ? 'text-[var(--color-gold)]' : i < 3 ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]',
                    ].join(' ')}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${row.rank}`}
                    </span>

                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-[var(--color-text-primary)] text-sm truncate">{row.displayName}</span>
                    </div>

                    <span className="font-bold tabular-nums text-[var(--color-text-primary)] text-sm text-right">
                      {row.score.toLocaleString()}
                    </span>

                    <span className="text-xs text-[var(--color-text-muted)] text-right hidden sm:block">
                      top {(100 - row.percentile).toFixed(1)}%
                    </span>

                    <Link
                      href={`/b/${row.shortCode}`}
                      className="hidden sm:flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]
                                 hover:text-[var(--color-sportstar-text)] transition-colors"
                      aria-label={`View ${row.displayName}'s bracket`}
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-[var(--color-text-muted)] text-center mt-4">
            {pretournament
              ? 'Live leaderboard unlocks after the first match. Submit your bracket to enter.'
              : 'Scores updated every 15 minutes during the tournament.'}
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**
```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**
```bash
git add app/leaderboard/page.tsx
git commit -m "feat: leaderboard page fetches live data from /api/leaderboard"
```

---

## Task 12: Update share page — fetch bracket from /api/brackets/[code]

**Files:**
- Modify: `app/b/[code]/page.tsx`

- [ ] **Step 1: Replace `app/b/[code]/page.tsx`**

```typescript
import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BracketSummary from '@/components/BracketSummary';
import { Trophy, Share2 } from 'lucide-react';
import type { GroupRanks, KnockoutPicks } from '@/types';

interface BracketData {
  shortCode:    string;
  displayName:  string;
  groupRanks:   GroupRanks;
  knockoutPicks: KnockoutPicks;
  tiebreakers:  { goldenBootTeam: string; finalTotalGoals: number };
  score:        number;
  submittedAt:  string;
}

async function getBracket(code: string): Promise<BracketData | null> {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3031';
    const res = await fetch(`${base}/api/brackets/${code}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const bracket  = await getBracket(code);
  const name     = bracket?.displayName ?? `Bracket ${code}`;
  return {
    title: `${name} — Sportstar WC 2026`,
    description: 'View this World Cup 2026 bracket prediction on Sportstar.',
  };
}

export default async function PublicBracketPage({ params }: { params: Promise<{ code: string }> }) {
  const { code }  = await params;
  const bracket   = await getBracket(code);

  return (
    <>
      <Header />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Bracket code chip */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)]
                          bg-[var(--color-ink-800)] px-4 py-1.5 mb-4">
            <span className="text-xs font-mono text-[var(--color-text-muted)]">Bracket</span>
            <span className="text-sm font-bold text-[var(--color-text-primary)] font-mono">{code}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] mb-1">
            {bracket ? bracket.displayName : 'World Cup 2026 Bracket'}
          </h1>
          {bracket && (
            <p className="text-sm text-[var(--color-text-secondary)]">
              Score: <span className="font-bold text-[var(--color-text-primary)]">{bracket.score.toLocaleString()} pts</span>
              {' · '}Submitted {new Date(bracket.submittedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>

        {bracket ? (
          /* Show the actual bracket */
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink-800)] p-6 mb-8 overflow-x-auto">
            <BracketSummary
              groupRanks={bracket.groupRanks}
              knockoutPicks={bracket.knockoutPicks}
              champion={bracket.knockoutPicks['FINAL'] ?? null}
            />
          </div>
        ) : (
          /* Bracket not found */
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink-800)] p-8 mb-8 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
              Bracket not found
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto">
              This bracket code doesn&apos;t exist or hasn&apos;t been submitted yet.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg
                       px-5 py-3 text-sm font-semibold border border-[var(--color-line)]
                       text-[var(--color-text-primary)] hover:bg-[var(--color-ink-700)] transition-colors"
          >
            <Share2 className="h-4 w-4" /> Share this bracket
          </button>
          <Link
            href="/build"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg
                       px-5 py-3 text-sm font-bold bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)]
                       hover:bg-[var(--color-sportstar-dim)] transition-colors"
          >
            <Trophy className="h-4 w-4" /> Build my own bracket
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**
```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**
```bash
git add "app/b/[code]/page.tsx"
git commit -m "feat: share page fetches live bracket data from /api/brackets/[code]"
```

---

## Task 13: Set up Supabase project + populate .env.local

This is a manual setup task. No code changes.

- [ ] **Step 1: Create Supabase project**
  1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign in with GitHub
  2. Click **New project** → name it `sportstar-wc2026` → choose a region close to India (Singapore or Mumbai) → set a DB password → **Create new project**
  3. Wait ~2 minutes for provisioning

- [ ] **Step 2: Run the schema**
  1. In Supabase dashboard → **SQL Editor**
  2. Paste contents of `supabase/schema.sql`
  3. Click **Run** → verify success message
  4. Go to **Table Editor** → confirm `bracket_submissions` and `tournament_results` tables exist
  5. Confirm `tournament_results` has one row: `season = '2026'`

- [ ] **Step 3: Collect API keys**
  1. Supabase dashboard → **Settings** → **API**
  2. Copy: **Project URL** → `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
  3. Copy: **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  4. Copy: **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY`

- [ ] **Step 4: Create `.env.local`**

Create `bracket-app/.env.local` (this file is gitignored):
```
SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
FOOTBALL_DATA_API_KEY=a2a6da78a2694a018c431ed1d6514692
CRON_SECRET=replace-with-output-of-openssl-rand-hex-32
```

Generate CRON_SECRET:
```bash
openssl rand -hex 32
```

- [ ] **Step 5: Restart dev server**
```bash
# Kill any running process on 3031, then restart
kill $(lsof -ti:3031) 2>/dev/null; sleep 1
cd "/Users/venkataprasad/Documents/Cursor:Antigravity/Football Bracket/bracket-app"
npm run dev -- --port 3031
```

---

## Task 14: Smoke test the full pipeline

- [ ] **Step 1: Test bracket submission endpoint**
```bash
curl -s -X POST http://localhost:3031/api/brackets \
  -H "Content-Type: application/json" \
  -d '{
    "shortCode": "testcode1",
    "displayName": "Test User",
    "groupRanks": {},
    "knockoutPicks": {},
    "tiebreakers": {"goldenBootTeam":"","finalTotalGoals":5},
    "submittedAt": "2026-06-04T10:00:00Z"
  }' | jq .
```
Expected: `{"shortCode":"testcode1","score":0}`

- [ ] **Step 2: Verify row in Supabase**

In Supabase → Table Editor → `bracket_submissions` → confirm row with `short_code = 'testcode1'` exists.

- [ ] **Step 3: Test leaderboard endpoint**
```bash
curl -s http://localhost:3031/api/leaderboard | jq .
```
Expected: `{"entries":[{"rank":1,"displayName":"Test User","shortCode":"testcode1","score":0,...}],"total":1}`

- [ ] **Step 4: Test bracket fetch endpoint**
```bash
curl -s http://localhost:3031/api/brackets/testcode1 | jq .
```
Expected: bracket data JSON with `shortCode: "testcode1"`.

- [ ] **Step 5: Test cron endpoint (no secret set)**
```bash
curl -s http://localhost:3031/api/cron/sync-results | jq .
```
Expected (pre-tournament, no finished matches): `{"synced":true,"matchesProcessed":0,"bracketsRescored":1,...}`

- [ ] **Step 6: Test leaderboard page renders**

Open `http://localhost:3031/leaderboard` in browser. Confirm:
- No mock data showing
- "0 submissions" or "1 submission" shown (the test row)
- Pre-tournament banner visible

- [ ] **Step 7: Clean up test row**
```bash
curl -s -X DELETE http://localhost:3031/api/brackets/testcode1 2>/dev/null || \
  echo "Delete not implemented — remove manually in Supabase Table Editor"
```
Go to Supabase → Table Editor → `bracket_submissions` → delete the `testcode1` row manually.

- [ ] **Step 8: Final commit**
```bash
git add -A
git commit -m "feat: complete data pipeline — football-data.org → Supabase → live scoring"
```
