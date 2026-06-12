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
  updated_at     timestamptz not null default now(),
  email          text
);

-- Index used by leaderboard query (score DESC, then submitted_at ASC for tiebreak)
create index if not exists bracket_submissions_score_idx
  on bracket_submissions (score desc, submitted_at asc);

-- ─── tournament_results ───────────────────────────────────────────────────────
-- Singleton row (season = '2026') updated by the cron job after every sync.
-- group_standings:  { "A": ["usa","pan","hon","blo"], "B": [...], ... }
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
