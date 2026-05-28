/**
 * Scoring engine — computes points for a bracket against known results.
 * Used server-side (post-match) and locally for the review screen mock.
 */
import type { GroupRanks, KnockoutPicks, Tiebreakers, ScoreBreakdown, GroupCode } from '@/types';
import { SCORING_CONFIG } from '@/data/bracket';
import { ALL_SLOTS } from '@/data/bracket';

interface TournamentResults {
  groupStandings: Partial<Record<GroupCode, [string, string, string, string]>>;
  knockoutResults: Record<string, string>;  // slotCode → winner teamId
  goldenBootTeam?: string;
  finalTotalGoals?: number;
}

export function scoreGroupStage(
  userRanks: GroupRanks,
  official: TournamentResults['groupStandings']
): number {
  let total = 0;
  for (const [g, officialRanks] of Object.entries(official) as [GroupCode, [string,string,string,string]][]) {
    const user = userRanks[g];
    if (!user || !officialRanks) continue;
    if (user[0] === officialRanks[0] &&
        user[1] === officialRanks[1] &&
        user[2] === officialRanks[2] &&
        user[3] === officialRanks[3]) {
      total += SCORING_CONFIG.groupExact;
    } else if (
      new Set([user[0], user[1]]).size === 2 &&
      new Set([user[0], user[1]]).has(officialRanks[0]) &&
      new Set([user[0], user[1]]).has(officialRanks[1])
    ) {
      total += SCORING_CONFIG.groupTop2;
      if (user[0] === officialRanks[0]) total += SCORING_CONFIG.groupWinner;
    } else if (user[0] === officialRanks[0]) {
      total += SCORING_CONFIG.groupWinner;
    }
  }
  return total;
}

export function scoreKnockout(
  userPicks: KnockoutPicks,
  results: TournamentResults['knockoutResults']
): Partial<ScoreBreakdown> {
  const breakdown: Partial<ScoreBreakdown> = { r32: 0, r16: 0, qf: 0, sf: 0, final: 0, third: 0 };
  const stagePoints: Record<string, number> = {
    r32: SCORING_CONFIG.r32,
    r16: SCORING_CONFIG.r16,
    qf:  SCORING_CONFIG.qf,
    sf:  SCORING_CONFIG.sf,
    final: SCORING_CONFIG.final,
    third: SCORING_CONFIG.third,
  };
  for (const slot of ALL_SLOTS) {
    const userPick = userPicks[slot.slotCode];
    const official = results[slot.slotCode];
    if (userPick && official && userPick === official) {
      const key = slot.stage as keyof typeof breakdown;
      (breakdown[key] as number) += stagePoints[slot.stage] ?? 0;
    }
  }
  return breakdown;
}

export function scoreTiebreakers(
  tiebreakers: Tiebreakers,
  results: TournamentResults
): number {
  let total = 0;
  if (results.goldenBootTeam && tiebreakers.goldenBootTeam === results.goldenBootTeam) {
    total += SCORING_CONFIG.tbGoldenBootExact;
  }
  if (results.finalTotalGoals !== undefined) {
    const diff = Math.abs(tiebreakers.finalTotalGoals - results.finalTotalGoals);
    if (diff === 0) total += SCORING_CONFIG.tbFinalGoalsExact;
    else if (diff === 1) total += SCORING_CONFIG.tbFinalGoalsPlusMinus1;
  }
  return total;
}

export function computeFullScore(
  groupRanks: GroupRanks,
  knockoutPicks: KnockoutPicks,
  tiebreakers: Tiebreakers,
  results: TournamentResults
): ScoreBreakdown {
  const group       = scoreGroupStage(groupRanks, results.groupStandings);
  const ko          = scoreKnockout(knockoutPicks, results.knockoutResults);
  const tb          = scoreTiebreakers(tiebreakers, results);
  const total       = group + (ko.r32??0) + (ko.r16??0) + (ko.qf??0) + (ko.sf??0)
                    + (ko.final??0) + (ko.third??0) + tb;
  return {
    group,
    r32:   ko.r32   ?? 0,
    r16:   ko.r16   ?? 0,
    qf:    ko.qf    ?? 0,
    sf:    ko.sf    ?? 0,
    final: ko.final ?? 0,
    third: ko.third ?? 0,
    tiebreakers: tb,
    total,
  };
}
