// ─── Teams ───────────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  short: string;   // 3-letter abbrev
  flag: string;    // emoji flag
  group: GroupCode;
  confederation: 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC';
  color: string;   // primary hex for UI accents
}

export type GroupCode = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';
export const GROUP_CODES: GroupCode[] = ['A','B','C','D','E','F','G','H','I','J','K','L'];

// ─── Group picks ─────────────────────────────────────────────────────────────

// Ordered array of 4 team IDs: index 0 = 1st place, index 3 = 4th place
export type GroupRank = [string, string, string, string];
export type GroupRanks = Partial<Record<GroupCode, GroupRank>>;

// ─── Knockout ────────────────────────────────────────────────────────────────

export type Stage = 'r32' | 'r16' | 'qf' | 'sf' | 'final' | 'third';

export type SlotSource =
  | { kind: 'group'; group: GroupCode; position: 1 | 2 | 3 }
  | { kind: 'slot';  slot: string;    result: 'winner' | 'loser' };

export interface MatchSlot {
  slotCode: string;
  stage: Stage;
  matchLabel: string;       // "Match 1", "QF 3", etc.
  homeSource: SlotSource;
  awaySource: SlotSource;
}

// slot code → picked winner team ID
export type KnockoutPicks = Record<string, string>;

// ─── Tiebreakers ─────────────────────────────────────────────────────────────

export interface Tiebreakers {
  goldenBootTeam: string;   // team ID the user thinks wins Golden Boot
  finalTotalGoals: number;  // 0-20
}

// ─── Full bracket state ───────────────────────────────────────────────────────

export type BuildStep =
  | 'welcome'
  | 'groups'
  | 'r32'
  | 'r16'
  | 'qf'
  | 'sf'
  | 'final'
  | 'tiebreakers'
  | 'review';

export interface BracketState {
  displayName: string;
  email:       string;
  status: 'empty' | 'draft' | 'submitted';
  currentStep: BuildStep;
  groupRanks: GroupRanks;
  knockoutPicks: KnockoutPicks;
  tiebreakers: Tiebreakers;
  submittedAt?: string;
  shortCode?: string;
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

export interface ScoringConfig {
  groupExact: number;
  groupTop2: number;
  groupWinner: number;
  r32: number;
  r16: number;
  qf: number;
  sf: number;
  third: number;
  final: number;
  tbGoldenBootExact: number;
  tbFinalGoalsExact: number;
  tbFinalGoalsPlusMinus1: number;
}

export interface ScoreBreakdown {
  group: number;
  r32: number;
  r16: number;
  qf: number;
  sf: number;
  final: number;
  third: number;
  tiebreakers: number;
  total: number;
}

// ─── Leaderboard (mock / local) ───────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  shortCode: string;
  score: number;
  percentile: number;
  submittedAt: string;
}
