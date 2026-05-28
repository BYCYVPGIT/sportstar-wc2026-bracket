import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Trophy, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Leaderboard — Sportstar WC 2026 Bracket',
};

// Mock leaderboard data — replaced by live DB queries once backend is wired
const MOCK_ROWS = [
  { rank: 1,    name: 'Sportstar Editors',    code: 'sportstar-editors', score: 2840, percentile: 99.9, flag: '⭐' },
  { rank: 2,    name: 'Ravi from Bengaluru',  code: 'k8a2x9q1',          score: 2610, percentile: 99.7, flag: '🇮🇳' },
  { rank: 3,    name: 'Mumbai Football Club', code: 'mj7p3nt5',          score: 2540, percentile: 99.5, flag: '🇮🇳' },
  { rank: 4,    name: 'Priya S',              code: 'r4t8w2mn',          score: 2500, percentile: 99.2, flag: '🇮🇳' },
  { rank: 5,    name: 'Chennai Banter',       code: 'q9z1hy6r',          score: 2490, percentile: 99.0, flag: '🇮🇳' },
  { rank: 6,    name: 'Arjun K',              code: 'b5n3cv8k',          score: 2450, percentile: 98.8, flag: '🇮🇳' },
  { rank: 7,    name: 'Delhi Diehards',       score: 2420, code: 'x7m2ql4p', percentile: 98.5, flag: '🇮🇳' },
  { rank: 8,    name: 'Vikram P',             score: 2390, code: 'g3k9fw5t', percentile: 98.2, flag: '🇮🇳' },
  { rank: 9,    name: 'Hyderabad FC Fan',     score: 2360, code: 'e6y4dn2s', percentile: 97.9, flag: '🇮🇳' },
  { rank: 10,   name: 'Ananya M',             score: 2310, code: 'p1v8xu3j', percentile: 97.5, flag: '🇮🇳' },
];

const STAGES = [
  { label: 'Group Stage',    score: '—',   note: 'Begins 11 Jun' },
  { label: 'Round of 32',    score: '—',   note: 'From 29 Jun' },
  { label: 'Round of 16',    score: '—',   note: 'From 5 Jul' },
  { label: 'Quarter-finals', score: '—',   note: 'From 9 Jul' },
  { label: 'Semi-finals',    score: '—',   note: 'From 14 Jul' },
  { label: 'Final',          score: '—',   note: '19 Jul' },
];

export default function LeaderboardPage() {
  return (
    <>
      <Header />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-sportstar)] mb-1">
              Sportstar · WC 2026
            </p>
            <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)]">Leaderboard</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Updated after every completed match · Pre-tournament preview
            </p>
          </div>
          <Link
            href="/build"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold
                       bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)] hover:bg-[var(--color-sportstar-dim)] transition-colors shrink-0"
          >
            <Trophy className="h-4 w-4" /> Enter your bracket
          </Link>
        </div>

        {/* Pre-tournament banner */}
        <div className="rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5
                        p-4 mb-8 text-sm text-[var(--color-gold)]">
          🏆 The tournament hasn&apos;t started yet — submit your bracket now to appear here.
          The leaderboard goes live after the first match on <strong>11 June 2026</strong>.
        </div>

        {/* Tournament progress */}
        <section className="mb-8">
          <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-3">Tournament progress</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {STAGES.map(s => (
              <div key={s.label}
                className="rounded-lg border border-[var(--color-line)] bg-[var(--color-ink-800)] p-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-1">{s.label}</p>
                <p className="text-lg font-bold text-[var(--color-text-muted)] tabular-nums">{s.score}</p>
                <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">{s.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Table */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">Top brackets</h2>
            <span className="text-xs text-[var(--color-text-muted)]">Showing preview · 0 submissions</span>
          </div>

          <div className="rounded-xl border border-[var(--color-line)] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[3rem_1fr_auto_auto] sm:grid-cols-[3rem_1fr_auto_auto_auto]
                            gap-x-4 px-4 py-2.5 bg-[var(--color-ink-800)] border-b border-[var(--color-line)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Rank</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Player</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] text-right">Score</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] text-right hidden sm:block">%ile</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] hidden sm:block"></span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[var(--color-line-dim)]">
              {MOCK_ROWS.map((row, i) => (
                <div
                  key={row.code}
                  className={[
                    'grid grid-cols-[3rem_1fr_auto_auto] sm:grid-cols-[3rem_1fr_auto_auto_auto]',
                    'gap-x-4 px-4 py-3 items-center hover:bg-[var(--color-ink-700)] transition-colors',
                    i === 0 ? 'bg-[var(--color-gold)]/5' : '',
                  ].join(' ')}
                >
                  {/* Rank */}
                  <span className={[
                    'font-bold tabular-nums text-sm',
                    i === 0 ? 'text-[var(--color-gold)]' : i < 3 ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]',
                  ].join(' ')}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${row.rank}`}
                  </span>

                  {/* Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{row.flag}</span>
                    <span className="font-semibold text-[var(--color-text-primary)] text-sm truncate">{row.name}</span>
                    {row.code === 'sportstar-editors' && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded
                                       bg-[var(--color-sportstar)]/20 text-[var(--color-sportstar)] shrink-0">
                        Editors
                      </span>
                    )}
                  </div>

                  {/* Score */}
                  <span className="font-bold tabular-nums text-[var(--color-text-primary)] text-sm text-right">{row.score.toLocaleString()}</span>

                  {/* Percentile */}
                  <span className="text-xs text-[var(--color-text-muted)] text-right hidden sm:block">
                    top {(100 - row.percentile).toFixed(1)}%
                  </span>

                  {/* Link */}
                  <Link
                    href={`/b/${row.code}`}
                    className="hidden sm:flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]
                               hover:text-[var(--color-sportstar)] transition-colors"
                    aria-label={`View ${row.name}'s bracket`}
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-[var(--color-text-muted)] text-center mt-4">
            Live leaderboard unlocks after the first match. Submit your bracket to enter.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
