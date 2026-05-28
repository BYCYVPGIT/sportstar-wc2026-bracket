import Link from 'next/link';
import { Trophy, Users, TrendingUp, ChevronRight, Star } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CountdownTimer from '@/components/CountdownTimer';
import { GROUP_CODES } from '@/types';
import { TEAMS } from '@/data/teams';

const HOW_IT_WORKS = [
  {
    icon: '🗂️',
    title: 'Rank the groups',
    body: 'Predict the final standings in all 12 groups — who finishes 1st, 2nd, 3rd, 4th.',
  },
  {
    icon: '🏆',
    title: 'Build the knockout',
    body: 'Pick winners from the Round of 32 all the way to the Final and 3rd-place playoff.',
  },
  {
    icon: '🔒',
    title: 'Lock before kickoff',
    body: 'Your picks freeze the moment the first match starts. No editing after that.',
  },
  {
    icon: '📈',
    title: 'Climb the board',
    body: 'Earn points as results come in. Top the Sportstar leaderboard by July 19.',
  },
];

const SCORING_ROWS = [
  { stage: 'Group standings (exact)', pts: 50 },
  { stage: 'Group top 2 correct',     pts: 30 },
  { stage: 'Group winner correct',    pts: 10 },
  { stage: 'Round of 32',             pts: 30 },
  { stage: 'Round of 16',             pts: 60 },
  { stage: 'Quarter-final',           pts: 120 },
  { stage: 'Semi-final',              pts: 240 },
  { stage: 'Final (champion)',        pts: 500 },
];

export default function HubPage() {
  const marqueeTeams = TEAMS.slice(0, 24);

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-[var(--color-line)]
                            bg-[var(--color-ink-900)]">
          {/* Background grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-sportstar)]/30
                            bg-[var(--color-sportstar)]/10 px-3 py-1 mb-6">
              <span className="text-[var(--color-sportstar)] text-xs font-semibold uppercase tracking-wider">
                Sportstar · FIFA World Cup 2026
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--color-text-primary)]
                           leading-[1.1] tracking-tight mb-4">
              Pick the<br />
              <span className="text-[var(--color-sportstar)]">2026 World Cup.</span>
            </h1>
            <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-8 leading-relaxed">
              Build your bracket. Lock it before kickoff in New Jersey.
              Climb the Sportstar leaderboard across 39 days and 104 matches.
            </p>

            {/* Countdown */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                Picks lock at first kickoff · 11 June 2026
              </p>
              <CountdownTimer variant="large" />
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/build"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-bold
                           bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)]
                           hover:bg-[var(--color-sportstar-dim)] transition-colors shadow-lg"
              >
                <Trophy className="h-5 w-5" />
                Start my bracket
              </Link>
              <Link
                href="/how-to-play"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-medium
                           border border-[var(--color-line)] text-[var(--color-text-secondary)]
                           hover:text-[var(--color-text-primary)] hover:bg-[var(--color-ink-700)] transition-colors"
              >
                How it works <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Team marquee ──────────────────────────────────────────────── */}
        <div className="overflow-hidden py-4 border-b border-[var(--color-line)] bg-[var(--color-ink-950)]">
          <div className="flex gap-6 whitespace-nowrap w-max" style={{ animation: 'marquee 30s linear infinite' }}>
            {[...marqueeTeams, ...marqueeTeams].map((t, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                <span className="text-xl">{t.flag}</span>
                <span className="font-medium">{t.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Stats bar ─────────────────────────────────────────────────── */}
        <section className="border-b border-[var(--color-line)] bg-[var(--color-ink-800)]">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { value: '48',    label: 'Teams',      icon: <Users className="h-4 w-4" /> },
                { value: '104',   label: 'Matches',    icon: <TrendingUp className="h-4 w-4" /> },
                { value: '39',    label: 'Days',       icon: <Star className="h-4 w-4" /> },
                { value: '4,500+',label: 'Max points', icon: <Trophy className="h-4 w-4" /> },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center gap-1">
                  <span className="text-[var(--color-text-muted)]">{s.icon}</span>
                  <span className="text-3xl font-extrabold text-[var(--color-text-primary)] tabular-nums">{s.value}</span>
                  <span className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider font-medium">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section className="py-16 border-b border-[var(--color-line)]">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] text-center mb-10">How it works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={i} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-ink-800)] p-5">
                  <div className="text-3xl mb-3">{step.icon}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-5 w-5 rounded-full bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)]
                                     text-[10px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <h3 className="font-bold text-[var(--color-text-primary)] text-sm">{step.title}</h3>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Groups preview ────────────────────────────────────────────── */}
        <section className="py-16 border-b border-[var(--color-line)] bg-[var(--color-ink-900)]">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">The 12 Groups</h2>
              <Link href="/build" className="text-sm text-[var(--color-sportstar)] hover:underline flex items-center gap-1">
                Pick now <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {GROUP_CODES.map(g => {
                const teams = TEAMS.filter(t => t.group === g);
                return (
                  <div key={g} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-ink-800)] p-3">
                    <p className="text-xs font-bold text-[var(--color-sportstar)] mb-2">Group {g}</p>
                    <div className="space-y-1.5">
                      {teams.map(t => (
                        <div key={t.id} className="flex items-center gap-1.5">
                          <span className="text-base">{t.flag}</span>
                          <span className="text-xs text-[var(--color-text-primary)] truncate">{t.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Scoring ───────────────────────────────────────────────────── */}
        <section className="py-16 border-b border-[var(--color-line)]">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] text-center mb-2">Scoring</h2>
            <p className="text-center text-[var(--color-text-secondary)] mb-8 text-sm">
              Points double each round — your bracket stays alive until the final whistle.
            </p>
            <div className="rounded-xl border border-[var(--color-line)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-line)] bg-[var(--color-ink-800)]">
                    <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wide">Stage</th>
                    <th className="text-right px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wide">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-line-dim)]">
                  {SCORING_ROWS.map(r => (
                    <tr key={r.stage} className="hover:bg-[var(--color-ink-800)] transition-colors">
                      <td className="px-4 py-3 text-[var(--color-text-primary)]">{r.stage}</td>
                      <td className="px-4 py-3 text-right font-bold text-[var(--color-gold)] tabular-nums">+{r.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] text-center mt-3">
              Plus tiebreaker bonuses. See{' '}
              <Link href="/how-to-play" className="text-[var(--color-sportstar)] hover:underline">full scoring rules</Link>.
            </p>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="mx-auto max-w-xl px-4 sm:px-6 text-center">
            <p className="text-4xl mb-4">⚽</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-3">Ready to pick?</h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              It takes under 5 minutes. Your picks are saved as you go.
            </p>
            <Link
              href="/build"
              className="inline-flex items-center gap-2 rounded-lg px-8 py-4 text-base font-bold
                         bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)]
                         hover:bg-[var(--color-sportstar-dim)] transition-colors"
            >
              <Trophy className="h-5 w-5" /> Build my bracket
            </Link>
            <p className="text-xs text-[var(--color-text-muted)] mt-4">
              Free to play. No cash prizes. For bragging rights only.
            </p>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
}
