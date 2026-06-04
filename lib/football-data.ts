/**
 * football-data.org API client for FIFA WC 2026.
 * Handles HTTP, maps external IDs to internal team IDs, and resolves
 * real-world match results to our internal slotCode graph.
 */
import type { GroupCode, GroupRanks, KnockoutPicks } from '@/types';
import { ALL_SLOTS } from '@/data/bracket';
import { resolveMatchTeams } from '@/lib/bracket';

const BASE_URL    = 'https://api.football-data.org/v4';
const COMPETITION = 2000; // FIFA World Cup (same ID reused each edition)

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
  LAST_32:                  'r32',
  LAST_16:                  'r16',
  QUARTER_FINALS:           'qf',
  SEMI_FINALS:              'sf',
  FINAL:                    'final',
  THIRD_PLACE:              'third',
  PLAY_OFF_FOR_THIRD_PLACE: 'third',
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
  )) as {
    matches?: Array<{
      stage:    string;
      homeTeam: { tla: string };
      awayTeam: { tla: string };
      score:    { winner: string | null };
    }>;
  };

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
    if (!winnerId) continue; // match not yet decided

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
  )) as {
    standings?: Array<{
      type:  string;
      group: string;
      table: Array<{ position: number; team: { tla: string } }>;
    }>;
  };

  const result: GroupStandings = {};

  for (const standing of data.standings ?? []) {
    if (standing.type !== 'TOTAL') continue;
    // football-data.org uses "GROUP_A" → we need "A"
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
 * teams using groupStandings + already-known knockoutResults, and find
 * the slot whose teams match the match's teams.
 *
 * Returns null if no slot matches (e.g. group standings not yet populated).
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
