'use client';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { GroupCode, GroupRank } from '@/types';
import { TEAMS_BY_ID, GROUP_TEAMS } from '@/data/teams';
import { useBracketStore } from '@/lib/store';

interface GroupCardProps {
  group: GroupCode;
  highlight?: boolean;
}

const POSITION_LABELS = ['1st', '2nd', '3rd', '4th'];
const ADVANCE_COUNT = 2; // top 2 qualify automatically; 3rd may qualify as best 3rd

export default function GroupCard({ group, highlight }: GroupCardProps) {
  const groupRanks  = useBracketStore(s => s.groupRanks);
  const moveUp      = useBracketStore(s => s.moveTeamUp);
  const moveDown    = useBracketStore(s => s.moveTeamDown);

  const defaultOrder = GROUP_TEAMS[group] as GroupRank;
  const ranks: GroupRank = groupRanks[group] ?? defaultOrder;

  const isComplete = !!groupRanks[group];

  return (
    <div
      className={[
        'rounded-xl border transition-all',
        highlight
          ? 'border-[var(--color-gold)]/50 shadow-[0_0_0_1px_var(--color-gold)/20]'
          : 'border-[var(--color-line)]',
        'bg-[var(--color-ink-800)]',
      ].join(' ')}
    >
      {/* Group header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-line)]">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)]
                           text-xs font-bold flex items-center justify-center">
            {group}
          </span>
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">Group {group}</span>
        </div>
        {isComplete ? (
          <span className="text-[10px] font-semibold uppercase tracking-wider
                           text-[var(--color-pitch)] bg-[var(--color-pitch)]/10
                           px-2 py-0.5 rounded-full">
            Done
          </span>
        ) : (
          <span className="text-[10px] text-[var(--color-text-muted)]">Drag to rank</span>
        )}
      </div>

      {/* Team rows */}
      <div className="divide-y divide-[var(--color-line-dim)]">
        {ranks.map((teamId, idx) => {
          const team = TEAMS_BY_ID[teamId];
          if (!team) return null;
          const pos = idx + 1;
          const advances = pos <= ADVANCE_COUNT;
          const mayQualify = pos === 3;

          return (
            <div
              key={teamId}
              className={[
                'flex items-center gap-3 px-4 py-2.5 transition-colors',
                advances ? 'bg-[var(--color-pitch)]/5' : '',
              ].join(' ')}
            >
              {/* Position badge */}
              <span
                className={[
                  'w-6 shrink-0 text-center text-xs font-bold',
                  advances    ? 'text-[var(--color-pitch)]'
                  : mayQualify ? 'text-[var(--color-gold)]'
                  :             'text-[var(--color-text-muted)]',
                ].join(' ')}
                aria-label={`Position ${POSITION_LABELS[idx]}`}
              >
                {pos}
              </span>

              {/* Flag */}
              <span className="text-xl leading-none" aria-label={`Flag of ${team.name}`}>
                {team.flag}
              </span>

              {/* Name */}
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-[var(--color-text-primary)] truncate">{team.name}</span>
                <span className="block text-[10px] text-[var(--color-text-muted)]">
                  {advances    ? '✓ Advances'
                  : mayQualify ? 'May qualify (best 3rd)'
                  :             'Eliminated'}
                </span>
              </span>

              {/* Arrows */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => moveUp(group, teamId)}
                  disabled={idx === 0}
                  aria-label={`Move ${team.name} up`}
                  className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]
                             hover:bg-[var(--color-ink-600)] disabled:opacity-20 disabled:cursor-not-allowed
                             transition-colors"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveDown(group, teamId)}
                  disabled={idx === 3}
                  aria-label={`Move ${team.name} down`}
                  className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]
                             hover:bg-[var(--color-ink-600)] disabled:opacity-20 disabled:cursor-not-allowed
                             transition-colors"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
