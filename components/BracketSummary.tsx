'use client';
import type { GroupRanks, KnockoutPicks } from '@/types';
import { TEAMS_BY_ID, GROUP_TEAMS } from '@/data/teams';
import { GROUP_CODES } from '@/types';
import { ALL_SLOTS } from '@/data/bracket';
import { resolveMatchTeams } from '@/lib/bracket';

interface BracketSummaryProps {
  groupRanks: GroupRanks;
  knockoutPicks: KnockoutPicks;
  champion?: string | null;
}

export default function BracketSummary({ groupRanks, knockoutPicks, champion }: BracketSummaryProps) {
  const champTeam = champion ? TEAMS_BY_ID[champion] : null;

  // Group view: highlight qualifiers
  const groupSection = GROUP_CODES.map(g => {
    const ranks = groupRanks[g] ?? GROUP_TEAMS[g];
    return { group: g, ranks };
  });

  // Knockout rounds
  const knockoutRounds = [
    { label: 'Round of 32',    slots: ALL_SLOTS.filter(s => s.stage === 'r32') },
    { label: 'Round of 16',    slots: ALL_SLOTS.filter(s => s.stage === 'r16') },
    { label: 'Quarter-finals', slots: ALL_SLOTS.filter(s => s.stage === 'qf') },
    { label: 'Semi-finals',    slots: ALL_SLOTS.filter(s => s.stage === 'sf') },
    { label: '3rd Place',      slots: ALL_SLOTS.filter(s => s.stage === 'third') },
    { label: 'The Final',      slots: ALL_SLOTS.filter(s => s.stage === 'final') },
  ];

  return (
    <div className="space-y-8">
      {/* Champion banner */}
      {champTeam && (
        <div className="rounded-2xl border border-[var(--color-gold)]/40
                        bg-gradient-to-br from-[var(--color-ink-800)] to-[var(--color-ink-900)]
                        p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-2">
            Your World Cup Champion
          </p>
          <p className="text-5xl mb-2">{champTeam.flag}</p>
          <p className="champion-glow text-3xl font-extrabold">{champTeam.name}</p>
        </div>
      )}

      {/* Groups */}
      <section>
        <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-3">Group Stage Predictions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {groupSection.map(({ group, ranks }) => (
            <div key={group}
              className="rounded-lg border border-[var(--color-line)] bg-[var(--color-ink-800)] p-3">
              <p className="text-xs font-bold text-[var(--color-sportstar)] mb-2">Group {group}</p>
              <ol className="space-y-1.5">
                {ranks.map((id, i) => {
                  const team = TEAMS_BY_ID[id];
                  if (!team) return null;
                  return (
                    <li key={id} className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold w-4 shrink-0
                        ${i < 2 ? 'text-[var(--color-pitch)]' : i === 2 ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-muted)]'}`}>
                        {i + 1}
                      </span>
                      <span className="text-sm">{team.flag}</span>
                      <span className="text-xs text-[var(--color-text-primary)] truncate">{team.name}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* Knockout */}
      {knockoutRounds.map(round => (
        <section key={round.label}>
          <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-3">{round.label}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {round.slots.map(slot => {
              const [homeId, awayId] = resolveMatchTeams(slot.slotCode, groupRanks, knockoutPicks);
              const picked = knockoutPicks[slot.slotCode];
              const homeTeam = homeId ? TEAMS_BY_ID[homeId] : null;
              const awayTeam = awayId ? TEAMS_BY_ID[awayId] : null;
              const pickedTeam = picked ? TEAMS_BY_ID[picked] : null;

              return (
                <div key={slot.slotCode}
                  className="rounded-lg border border-[var(--color-line)] bg-[var(--color-ink-800)] p-3">
                  <p className="text-[10px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wide mb-2">
                    {slot.matchLabel}
                  </p>
                  <div className="space-y-1.5">
                    {[homeTeam, awayTeam].map((team, i) => (
                      <div key={i} className={`flex items-center gap-2 ${team?.id === picked ? 'opacity-100' : 'opacity-50'}`}>
                        <span className="text-base">{team?.flag ?? '?'}</span>
                        <span className="text-xs text-[var(--color-text-primary)]">{team?.name ?? 'TBD'}</span>
                        {team?.id === picked && (
                          <span className="ml-auto text-[var(--color-gold)] text-xs">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {pickedTeam && (
                    <p className="mt-2 text-[10px] text-[var(--color-pitch)] font-semibold">
                      → {pickedTeam.name}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
