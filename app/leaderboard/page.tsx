import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Trophy, ExternalLink } from 'lucide-react';
import type { LeaderboardEntry } from '@/types';

export const revalidate = 60; // refresh every 60 seconds

export const metadata: Metadata = {
  title: 'Leaderboard — Sportstar WC 2026 Bracket',
};

async function getLeaderboard(): Promise<{ entries: LeaderboardEntry[]; total: number }> {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3031';
    const res = await fetch(`${base}/api/leaderboard?limit=50`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { entries: [], total: 0 };
    return res.json();
  } catch {
    return { entries: [], total: 0 };
  }
}

const STAGES = [
  { label: 'Group Stage',    note: 'Begins 11 Jun' },
  { label: 'Round of 32',    note: 'From 29 Jun' },
  { label: 'Round of 16',    note: 'From 5 Jul' },
  { label: 'Quarter-finals', note: 'From 9 Jul' },
  { label: 'Semi-finals',    note: 'From 14 Jul' },
  { label: 'Final',          note: '19 Jul' },
];

export default async function LeaderboardPage() {
  const { entries, total } = await getLeaderboard();
  const pretournament = entries.length === 0;

  return (
    <>
      <Header />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-sportstar-text)] mb-1">
              Sportstar · WC 2026
            </p>
            <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)]">Leaderboard</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Updated after every completed match ·{' '}
              {total > 0 ? `${total.toLocaleString()} submissions` : 'Pre-tournament preview'}
            </p>
          </div>
          <Link
            href="/build"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold
                       bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)]
                       hover:bg-[var(--color-sportstar-dim)] transition-colors shrink-0"
          >
            <Trophy className="h-4 w-4" /> Enter your bracket
          </Link>
        </div>

        {/* Pre-tournament banner */}
        {pretournament && (
          <div className="rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5
                          p-4 mb-8 text-sm text-[var(--color-gold)]">
            🏆 The tournament hasn&apos;t started yet — submit your bracket now to appear here.
            The leaderboard goes live after the first match on{' '}
            <strong>11 June 2026</strong>.
          </div>
        )}

        {/* Tournament progress */}
        <section className="mb-8">
          <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-3">
            Tournament progress
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {STAGES.map(s => (
              <div
                key={s.label}
                className="rounded-lg border border-[var(--color-line)] bg-[var(--color-ink-800)] p-3 text-center"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-1">
                  {s.label}
                </p>
                <p className="text-lg font-bold text-[var(--color-text-muted)] tabular-nums">—</p>
                <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">{s.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Table */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">Top brackets</h2>
            <span className="text-xs text-[var(--color-text-muted)]">
              {total > 0 ? `Showing top 50 of ${total.toLocaleString()}` : '0 submissions'}
            </span>
          </div>

          <div className="rounded-xl border border-[var(--color-line)] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[3rem_1fr_auto_auto] sm:grid-cols-[3rem_1fr_auto_auto_auto]
                            gap-x-4 px-4 py-2.5 bg-[var(--color-ink-800)] border-b border-[var(--color-line)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Rank</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Player</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] text-right">Score</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] text-right hidden sm:block">%ile</span>
              <span className="text-[10px] hidden sm:block" />
            </div>

            {/* Rows */}
            {entries.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-[var(--color-text-muted)]">
                No submissions yet — be the first to enter!
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-line-dim)]">
                {entries.map((row, i) => (
                  <div
                    key={row.shortCode}
                    className={[
                      'grid grid-cols-[3rem_1fr_auto_auto] sm:grid-cols-[3rem_1fr_auto_auto_auto]',
                      'gap-x-4 px-4 py-3 items-center hover:bg-[var(--color-ink-700)] transition-colors',
                      i === 0 ? 'bg-[var(--color-gold)]/5' : '',
                    ].join(' ')}
                  >
                    <span className={[
                      'font-bold tabular-nums text-sm',
                      i === 0
                        ? 'text-[var(--color-gold)]'
                        : i < 3
                          ? 'text-[var(--color-text-primary)]'
                          : 'text-[var(--color-text-muted)]',
                    ].join(' ')}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${row.rank}`}
                    </span>

                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-[var(--color-text-primary)] text-sm truncate">
                        {row.displayName}
                      </span>
                    </div>

                    <span className="font-bold tabular-nums text-[var(--color-text-primary)] text-sm text-right">
                      {row.score.toLocaleString()}
                    </span>

                    <span className="text-xs text-[var(--color-text-muted)] text-right hidden sm:block">
                      top {(100 - row.percentile).toFixed(1)}%
                    </span>

                    <Link
                      href={`/b/${row.shortCode}`}
                      className="hidden sm:flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]
                                 hover:text-[var(--color-sportstar-text)] transition-colors"
                      aria-label={`View ${row.displayName}'s bracket`}
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-[var(--color-text-muted)] text-center mt-4">
            {pretournament
              ? 'Live leaderboard unlocks after the first match. Submit your bracket to enter.'
              : 'Scores updated every 15 minutes during the tournament.'}
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
