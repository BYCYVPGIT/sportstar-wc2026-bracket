/**
 * Bracket graph resolution.
 * Given a user's group ranks and knockout picks, resolves which team occupies
 * each slot — or returns null if the upstream pick hasn't been made yet.
 */
import type { GroupRanks, KnockoutPicks, SlotSource, GroupCode } from '@/types';
import { SLOT_BY_CODE } from '@/data/bracket';

/** Resolve which team the user predicted for a given slot source */
export function resolveSource(
  src: SlotSource,
  groupRanks: GroupRanks,
  knockoutPicks: KnockoutPicks,
): string | null {
  if (src.kind === 'group') {
    const ranks = groupRanks[src.group as GroupCode];
    if (!ranks) return null;
    return ranks[src.position - 1] ?? null;
  }
  // kind === 'slot'
  if (src.result === 'winner') {
    return knockoutPicks[src.slot] ?? null;
  }
  // loser: need both teams in the match, then find the non-winner
  const slot = SLOT_BY_CODE[src.slot];
  if (!slot) return null;
  const home = resolveSource(slot.homeSource, groupRanks, knockoutPicks);
  const away = resolveSource(slot.awaySource, groupRanks, knockoutPicks);
  const winner = knockoutPicks[src.slot];
  if (!home || !away || !winner) return null;
  return winner === home ? away : home;
}

/** Returns the two team IDs for a given knockout slot (home, away) */
export function resolveMatchTeams(
  slotCode: string,
  groupRanks: GroupRanks,
  knockoutPicks: KnockoutPicks,
): [string | null, string | null] {
  const slot = SLOT_BY_CODE[slotCode];
  if (!slot) return [null, null];
  return [
    resolveSource(slot.homeSource, groupRanks, knockoutPicks),
    resolveSource(slot.awaySource, groupRanks, knockoutPicks),
  ];
}

/** How many knockout slots have been picked */
export function countKnockoutPicks(knockoutPicks: KnockoutPicks): number {
  return Object.keys(knockoutPicks).length;
}

/** How many groups have been fully ranked */
export function countCompletedGroups(groupRanks: GroupRanks): number {
  return Object.values(groupRanks).filter(r => r && r.length === 4).length;
}

/** Validate that a knockout pick is consistent (chosen team is in the slot) */
export function isPickValid(
  slotCode: string,
  pickedTeamId: string,
  groupRanks: GroupRanks,
  knockoutPicks: KnockoutPicks,
): boolean {
  const [home, away] = resolveMatchTeams(slotCode, groupRanks, knockoutPicks);
  return pickedTeamId === home || pickedTeamId === away;
}

/**
 * When a group ranking changes, any downstream knockout pick that referenced
 * a team now in a different position may be stale.  This function returns the
 * set of slot codes whose picks should be cleared.
 */
export function staleSlotsAfterGroupChange(
  changedGroup: GroupCode,
  groupRanks: GroupRanks,
  knockoutPicks: KnockoutPicks,
): string[] {
  const stale: string[] = [];
  for (const [slotCode, pickedId] of Object.entries(knockoutPicks)) {
    if (!isPickValid(slotCode, pickedId, groupRanks, knockoutPicks)) {
      stale.push(slotCode);
    }
  }
  return stale;
}

/** Check if entire bracket is complete (ready to submit) */
export function isBracketComplete(
  groupRanks: GroupRanks,
  knockoutPicks: KnockoutPicks,
): boolean {
  if (countCompletedGroups(groupRanks) < 12) return false;
  // 16 R32 + 8 R16 + 4 QF + 2 SF + 1 Final + 1 Third = 32 picks
  return countKnockoutPicks(knockoutPicks) === 32;
}

/** Generate a short random code for sharing */
export function generateShortCode(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
