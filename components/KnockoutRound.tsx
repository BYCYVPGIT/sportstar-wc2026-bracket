'use client';
import type { MatchSlot, Stage } from '@/types';
import { TEAMS_BY_ID } from '@/data/teams';
import { useBracketStore } from '@/lib/store';
import { resolveMatchTeams } from '@/lib/bracket';
import { TeamPill } from '@/components/TeamBadge';
import { X } from 'lucide-react';

interface KnockoutRoundProps {
  slots: MatchSlot[];
  stage: Stage;
  title: string;
}

export default function KnockoutRound({ slots, title }: KnockoutRoundProps) {
  const groupRanks    = useBracketStore(s => s.groupRanks);
  const knockoutPicks = useBracketStore(s => s.knockoutPicks);
  const pickWinner    = useBracketStore(s => s.pickKnockoutWinner);
  const clearPick     = useBracketStore(s => s.clearKnockoutPick);

  return (
    <div className="fade-in">
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">{title}</h2>
      <p className="text-sm text-[var(--color-text-secondary)] mb-5">
        Tap the team you think wins each match.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {slots.map(slot => {
          const [homeId, awayId] = resolveMatchTeams(slot.slotCode, groupRanks, knockoutPicks);
          const homeTeam = homeId ? TEAMS_BY_ID[homeId] : null;
          const awayTeam = awayId ? TEAMS_BY_ID[awayId] : null;
          const picked   = knockoutPicks[slot.slotCode];
          const canPick  = !!homeId && !!awayId;

          return (
            <div
              key={slot.slotCode}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-ink-800)] overflow-hidden"
            >
              {/* Match label */}
              <div className="flex items-center justify-between px-3 py-2
                              border-b border-[var(--color-line)] bg-[var(--color-ink-900)]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {slot.matchLabel}
                </span>
                {picked && (
                  <button
                    onClick={() => clearPick(slot.slotCode)}
                    aria-label="Clear pick"
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-sportstar-text)]
                               transition-colors p-0.5 rounded"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Teams */}
              <div className="p-3 space-y-2">
                {!canPick && (
                  <p className="text-xs text-[var(--color-text-muted)] italic text-center py-2">
                    Complete earlier rounds to unlock this match.
                  </p>
                )}
                {canPick && (
                  <>
                    <TeamPill
                      team={homeTeam}
                      picked={picked === homeId}
                      dimmed={!!picked && picked !== homeId}
                      onClick={() => pickWinner(slot.slotCode, homeId!)}
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-[var(--color-line)]" />
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)]">VS</span>
                      <div className="flex-1 h-px bg-[var(--color-line)]" />
                    </div>
                    <TeamPill
                      team={awayTeam}
                      picked={picked === awayId}
                      dimmed={!!picked && picked !== awayId}
                      onClick={() => pickWinner(slot.slotCode, awayId!)}
                    />
                  </>
                )}
              </div>

              {/* Pick confirmation */}
              {picked && (
                <div className="px-3 py-2 border-t border-[var(--color-line)]
                                bg-[var(--color-pitch)]/5 flex items-center gap-1.5">
                  <span className="text-[var(--color-pitch)] text-xs">✓</span>
                  <span className="text-xs text-[var(--color-pitch)]">
                    {TEAMS_BY_ID[picked]?.name} advances
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
