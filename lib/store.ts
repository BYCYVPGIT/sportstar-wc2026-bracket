'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BracketState, BuildStep, GroupCode, GroupRank, Tiebreakers } from '@/types';
import { generateShortCode, staleSlotsAfterGroupChange } from '@/lib/bracket';
import { GROUP_TEAMS } from '@/data/teams';

interface BracketStore extends BracketState {
  // Group stage
  setGroupRank: (group: GroupCode, ranks: GroupRank) => void;
  moveTeamUp: (group: GroupCode, teamId: string) => void;
  moveTeamDown: (group: GroupCode, teamId: string) => void;

  // Knockout
  pickKnockoutWinner: (slotCode: string, teamId: string) => void;
  clearKnockoutPick: (slotCode: string) => void;

  // Tiebreakers
  setTiebreaker: (key: keyof Tiebreakers, value: string | number) => void;

  // Navigation
  setStep: (step: BuildStep) => void;
  setDisplayName: (name: string) => void;

  // Submit
  submitBracket: () => void;
  resetBracket: () => void;
}

const defaultTiebreakers: Tiebreakers = {
  goldenBootTeam: '',
  finalTotalGoals: 5,
};

const initialState: BracketState = {
  displayName: '',
  status: 'empty',
  currentStep: 'welcome',
  groupRanks: {},
  knockoutPicks: {},
  tiebreakers: defaultTiebreakers,
};

export const useBracketStore = create<BracketStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setGroupRank: (group, ranks) =>
        set(state => {
          const newGroupRanks = { ...state.groupRanks, [group]: ranks };
          // Clear any stale knockout picks caused by this group change
          const stale = staleSlotsAfterGroupChange(group, newGroupRanks, state.knockoutPicks);
          const newKnockoutPicks = { ...state.knockoutPicks };
          stale.forEach(s => delete newKnockoutPicks[s]);
          return {
            groupRanks: newGroupRanks,
            knockoutPicks: newKnockoutPicks,
            status: 'draft',
          };
        }),

      moveTeamUp: (group, teamId) =>
        set(state => {
          const current = state.groupRanks[group] ?? (GROUP_TEAMS[group] as GroupRank);
          const idx = current.indexOf(teamId);
          if (idx <= 0) return {};
          const next = [...current] as GroupRank;
          [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
          const newGroupRanks = { ...state.groupRanks, [group]: next };
          const stale = staleSlotsAfterGroupChange(group, newGroupRanks, state.knockoutPicks);
          const newKnockoutPicks = { ...state.knockoutPicks };
          stale.forEach(s => delete newKnockoutPicks[s]);
          return { groupRanks: newGroupRanks, knockoutPicks: newKnockoutPicks, status: 'draft' };
        }),

      moveTeamDown: (group, teamId) =>
        set(state => {
          const current = state.groupRanks[group] ?? (GROUP_TEAMS[group] as GroupRank);
          const idx = current.indexOf(teamId);
          if (idx < 0 || idx >= 3) return {};
          const next = [...current] as GroupRank;
          [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
          const newGroupRanks = { ...state.groupRanks, [group]: next };
          const stale = staleSlotsAfterGroupChange(group, newGroupRanks, state.knockoutPicks);
          const newKnockoutPicks = { ...state.knockoutPicks };
          stale.forEach(s => delete newKnockoutPicks[s]);
          return { groupRanks: newGroupRanks, knockoutPicks: newKnockoutPicks, status: 'draft' };
        }),

      pickKnockoutWinner: (slotCode, teamId) =>
        set(state => {
          // Clear downstream picks that may now be invalid
          const newPicks = { ...state.knockoutPicks, [slotCode]: teamId };
          // Naively remove any pick that is now inconsistent downstream
          // (resolveSource will return null for them on render, showing them as unpicked)
          return { knockoutPicks: newPicks, status: 'draft' };
        }),

      clearKnockoutPick: (slotCode) =>
        set(state => {
          const picks = { ...state.knockoutPicks };
          delete picks[slotCode];
          return { knockoutPicks: picks };
        }),

      setTiebreaker: (key, value) =>
        set(state => ({
          tiebreakers: { ...state.tiebreakers, [key]: value },
          status: 'draft',
        })),

      setStep: (step) => set({ currentStep: step }),

      setDisplayName: (name) => set({ displayName: name, status: 'draft' }),

      submitBracket: () =>
        set(state => ({
          status: 'submitted',
          submittedAt: new Date().toISOString(),
          shortCode: state.shortCode ?? generateShortCode(),
        })),

      resetBracket: () => set({ ...initialState }),
    }),
    {
      name: 'sportstar-wc2026-bracket',
      version: 1,
    }
  )
);
