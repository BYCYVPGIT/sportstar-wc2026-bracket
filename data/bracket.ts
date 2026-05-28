import type { MatchSlot, GroupCode } from '@/types';

// ─── FIFA WC 2026 Bracket Slot Graph ─────────────────────────────────────────
//
// 48 teams → 12 groups of 4.
// Top 2 from each group = 24 automatic qualifiers.
// 8 best 3rd-placed teams (from groups A–H) = 8 more qualifiers.
// Total: 32 teams in the Round of 32.
//
// R32 seeding (simplified for bracket builder):
//   Matches 1-8:  group winners vs runners-up from paired groups
//   Matches 9-12: remaining pairs
//   Matches 13-16: 3rd-placed team slots
//
// R16 → QF → SF → FINAL + THIRD follow standard single-elimination.

export const R32_SLOTS: MatchSlot[] = [
  {
    slotCode: 'R32-M1',  stage: 'r32', matchLabel: 'R32 · M1',
    homeSource: { kind: 'group', group: 'A', position: 1 },
    awaySource: { kind: 'group', group: 'B', position: 2 },
  },
  {
    slotCode: 'R32-M2',  stage: 'r32', matchLabel: 'R32 · M2',
    homeSource: { kind: 'group', group: 'B', position: 1 },
    awaySource: { kind: 'group', group: 'A', position: 2 },
  },
  {
    slotCode: 'R32-M3',  stage: 'r32', matchLabel: 'R32 · M3',
    homeSource: { kind: 'group', group: 'C', position: 1 },
    awaySource: { kind: 'group', group: 'D', position: 2 },
  },
  {
    slotCode: 'R32-M4',  stage: 'r32', matchLabel: 'R32 · M4',
    homeSource: { kind: 'group', group: 'D', position: 1 },
    awaySource: { kind: 'group', group: 'C', position: 2 },
  },
  {
    slotCode: 'R32-M5',  stage: 'r32', matchLabel: 'R32 · M5',
    homeSource: { kind: 'group', group: 'E', position: 1 },
    awaySource: { kind: 'group', group: 'F', position: 2 },
  },
  {
    slotCode: 'R32-M6',  stage: 'r32', matchLabel: 'R32 · M6',
    homeSource: { kind: 'group', group: 'F', position: 1 },
    awaySource: { kind: 'group', group: 'E', position: 2 },
  },
  {
    slotCode: 'R32-M7',  stage: 'r32', matchLabel: 'R32 · M7',
    homeSource: { kind: 'group', group: 'G', position: 1 },
    awaySource: { kind: 'group', group: 'H', position: 2 },
  },
  {
    slotCode: 'R32-M8',  stage: 'r32', matchLabel: 'R32 · M8',
    homeSource: { kind: 'group', group: 'H', position: 1 },
    awaySource: { kind: 'group', group: 'G', position: 2 },
  },
  {
    slotCode: 'R32-M9',  stage: 'r32', matchLabel: 'R32 · M9',
    homeSource: { kind: 'group', group: 'I', position: 1 },
    awaySource: { kind: 'group', group: 'J', position: 2 },
  },
  {
    slotCode: 'R32-M10', stage: 'r32', matchLabel: 'R32 · M10',
    homeSource: { kind: 'group', group: 'J', position: 1 },
    awaySource: { kind: 'group', group: 'I', position: 2 },
  },
  {
    slotCode: 'R32-M11', stage: 'r32', matchLabel: 'R32 · M11',
    homeSource: { kind: 'group', group: 'K', position: 1 },
    awaySource: { kind: 'group', group: 'L', position: 2 },
  },
  {
    slotCode: 'R32-M12', stage: 'r32', matchLabel: 'R32 · M12',
    homeSource: { kind: 'group', group: 'L', position: 1 },
    awaySource: { kind: 'group', group: 'K', position: 2 },
  },
  // 3rd-placed team slots (Groups A–H contribute their 3rd-placed qualifiers)
  {
    slotCode: 'R32-M13', stage: 'r32', matchLabel: 'R32 · M13',
    homeSource: { kind: 'group', group: 'A', position: 3 },
    awaySource: { kind: 'group', group: 'E', position: 3 },
  },
  {
    slotCode: 'R32-M14', stage: 'r32', matchLabel: 'R32 · M14',
    homeSource: { kind: 'group', group: 'B', position: 3 },
    awaySource: { kind: 'group', group: 'F', position: 3 },
  },
  {
    slotCode: 'R32-M15', stage: 'r32', matchLabel: 'R32 · M15',
    homeSource: { kind: 'group', group: 'C', position: 3 },
    awaySource: { kind: 'group', group: 'G', position: 3 },
  },
  {
    slotCode: 'R32-M16', stage: 'r32', matchLabel: 'R32 · M16',
    homeSource: { kind: 'group', group: 'D', position: 3 },
    awaySource: { kind: 'group', group: 'H', position: 3 },
  },
];

export const R16_SLOTS: MatchSlot[] = [
  { slotCode: 'R16-M1', stage: 'r16', matchLabel: 'R16 · M1',
    homeSource: { kind: 'slot', slot: 'R32-M1',  result: 'winner' },
    awaySource: { kind: 'slot', slot: 'R32-M2',  result: 'winner' } },
  { slotCode: 'R16-M2', stage: 'r16', matchLabel: 'R16 · M2',
    homeSource: { kind: 'slot', slot: 'R32-M3',  result: 'winner' },
    awaySource: { kind: 'slot', slot: 'R32-M4',  result: 'winner' } },
  { slotCode: 'R16-M3', stage: 'r16', matchLabel: 'R16 · M3',
    homeSource: { kind: 'slot', slot: 'R32-M5',  result: 'winner' },
    awaySource: { kind: 'slot', slot: 'R32-M6',  result: 'winner' } },
  { slotCode: 'R16-M4', stage: 'r16', matchLabel: 'R16 · M4',
    homeSource: { kind: 'slot', slot: 'R32-M7',  result: 'winner' },
    awaySource: { kind: 'slot', slot: 'R32-M8',  result: 'winner' } },
  { slotCode: 'R16-M5', stage: 'r16', matchLabel: 'R16 · M5',
    homeSource: { kind: 'slot', slot: 'R32-M9',  result: 'winner' },
    awaySource: { kind: 'slot', slot: 'R32-M10', result: 'winner' } },
  { slotCode: 'R16-M6', stage: 'r16', matchLabel: 'R16 · M6',
    homeSource: { kind: 'slot', slot: 'R32-M11', result: 'winner' },
    awaySource: { kind: 'slot', slot: 'R32-M12', result: 'winner' } },
  { slotCode: 'R16-M7', stage: 'r16', matchLabel: 'R16 · M7',
    homeSource: { kind: 'slot', slot: 'R32-M13', result: 'winner' },
    awaySource: { kind: 'slot', slot: 'R32-M14', result: 'winner' } },
  { slotCode: 'R16-M8', stage: 'r16', matchLabel: 'R16 · M8',
    homeSource: { kind: 'slot', slot: 'R32-M15', result: 'winner' },
    awaySource: { kind: 'slot', slot: 'R32-M16', result: 'winner' } },
];

export const QF_SLOTS: MatchSlot[] = [
  { slotCode: 'QF-M1', stage: 'qf', matchLabel: 'QF · M1',
    homeSource: { kind: 'slot', slot: 'R16-M1', result: 'winner' },
    awaySource: { kind: 'slot', slot: 'R16-M2', result: 'winner' } },
  { slotCode: 'QF-M2', stage: 'qf', matchLabel: 'QF · M2',
    homeSource: { kind: 'slot', slot: 'R16-M3', result: 'winner' },
    awaySource: { kind: 'slot', slot: 'R16-M4', result: 'winner' } },
  { slotCode: 'QF-M3', stage: 'qf', matchLabel: 'QF · M3',
    homeSource: { kind: 'slot', slot: 'R16-M5', result: 'winner' },
    awaySource: { kind: 'slot', slot: 'R16-M6', result: 'winner' } },
  { slotCode: 'QF-M4', stage: 'qf', matchLabel: 'QF · M4',
    homeSource: { kind: 'slot', slot: 'R16-M7', result: 'winner' },
    awaySource: { kind: 'slot', slot: 'R16-M8', result: 'winner' } },
];

export const SF_SLOTS: MatchSlot[] = [
  { slotCode: 'SF-M1', stage: 'sf', matchLabel: 'Semi-final 1',
    homeSource: { kind: 'slot', slot: 'QF-M1', result: 'winner' },
    awaySource: { kind: 'slot', slot: 'QF-M2', result: 'winner' } },
  { slotCode: 'SF-M2', stage: 'sf', matchLabel: 'Semi-final 2',
    homeSource: { kind: 'slot', slot: 'QF-M3', result: 'winner' },
    awaySource: { kind: 'slot', slot: 'QF-M4', result: 'winner' } },
];

export const FINAL_SLOT: MatchSlot = {
  slotCode: 'FINAL', stage: 'final', matchLabel: 'The Final',
  homeSource: { kind: 'slot', slot: 'SF-M1', result: 'winner' },
  awaySource: { kind: 'slot', slot: 'SF-M2', result: 'winner' },
};

export const THIRD_SLOT: MatchSlot = {
  slotCode: 'THIRD', stage: 'third', matchLabel: '3rd Place',
  homeSource: { kind: 'slot', slot: 'SF-M1', result: 'loser' },
  awaySource: { kind: 'slot', slot: 'SF-M2', result: 'loser' },
};

export const ALL_SLOTS: MatchSlot[] = [
  ...R32_SLOTS,
  ...R16_SLOTS,
  ...QF_SLOTS,
  ...SF_SLOTS,
  FINAL_SLOT,
  THIRD_SLOT,
];

export const SLOT_BY_CODE: Record<string, MatchSlot> = Object.fromEntries(
  ALL_SLOTS.map(s => [s.slotCode, s])
);

// Groups that contribute 3rd-placed qualifiers in our simplified model
export const THIRD_PLACE_QUALIFIER_GROUPS: GroupCode[] = ['A','B','C','D','E','F','G','H'];

// The lock timestamp (first kickoff: 2026-06-11 20:00 IST = 14:30 UTC)
export const LOCK_AT = new Date('2026-06-11T14:30:00Z');

export const SCORING_CONFIG = {
  groupExact:              50,
  groupTop2:               30,
  groupWinner:             10,
  r32:                     30,
  r16:                     60,
  qf:                     120,
  sf:                     240,
  third:                  200,
  final:                  500,
  tbGoldenBootExact:      150,
  tbFinalGoalsExact:      100,
  tbFinalGoalsPlusMinus1:  50,
} as const;
