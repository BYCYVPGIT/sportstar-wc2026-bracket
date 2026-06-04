import Link from 'next/link';
import { Trophy } from 'lucide-react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'How to Play — Sportstar WC 2026 Bracket',
  description: 'Rules, scoring breakdown, and strategy tips for the Sportstar FIFA World Cup 2026 Bracket Challenge.',
};

const SCORING_TABLE = [
  { stage: 'Group standings — exact (all 4 correct)',     pts: 50,  note: 'Per group' },
  { stage: 'Group top 2 correct (any order)',             pts: 30,  note: 'Per group' },
  { stage: 'Group winner correct',                        pts: 10,  note: 'Per group' },
  { stage: 'Round of 32 — correct winner',               pts: 30,  note: 'Per match' },
  { stage: 'Round of 16 — correct winner',               pts: 60,  note: 'Per match' },
  { stage: 'Quarter-final — correct winner',             pts: 120, note: 'Per match' },
  { stage: 'Semi-final — correct winner',                pts: 240, note: 'Per match' },
  { stage: '3rd Place Playoff — correct winner',         pts: 200, note: 'Per match' },
  { stage: 'Final — correct champion',                   pts: 500, note: 'One pick' },
  { stage: 'Tiebreaker — Golden Boot team (exact)',       pts: 150, note: 'Team, not player' },
  { stage: 'Tiebreaker — Final goals (exact)',            pts: 100, note: 'inc. extra time' },
  { stage: 'Tiebreaker — Final goals (±1)',               pts: 50,  note: 'inc. extra time' },
];

const FAQ = [
  {
    q: 'Can I edit my picks after submitting?',
    a: 'Yes — until the first match kicks off on 11 June 2026 at 20:00 IST. After that your bracket is locked forever.',
  },
  {
    q: 'What is the Round of 32?',
    a: 'FIFA WC 2026 is the first 48-team World Cup. Instead of starting at the Round of 16, the knockout stage begins with a Round of 32 — 32 teams play 16 matches to reach the R16.',
  },
  {
    q: 'Which 3rd-placed teams advance to the Round of 32?',
    a: 'In the real tournament, the 8 best 3rd-placed teams qualify. In your bracket, the 3rd-placed teams from Groups A–H are used for the four 3rd-place slots in the R32. These are seeded in the builder automatically from your group rankings.',
  },
  {
    q: 'How are ties broken on the leaderboard?',
    a: 'First by total score, then by tiebreaker accuracy (Golden Boot, then Final goals), then by earliest submission time.',
  },
  {
    q: 'What happens if a team withdraws before the tournament?',
    a: "We'll substitute the replacement team and give affected users a one-time re-pick. All other picks remain intact.",
  },
  {
    q: 'Is there a prize?',
    a: 'This is a free-to-play prediction game for bragging rights. No cash prizes. The Hindu Group may announce editorial prizes (e.g. a year of Sportstar Premium) — follow @sportstarweb for announcements.',
  },
  {
    q: 'Can I create a private group for friends?',
    a: 'Coming very soon — private leagues with invite links are launching before the tournament. Watch this space.',
  },
  {
    q: 'Can I delete my bracket?',
    a: 'Email us at bracket@sportstar.thehindu.com and we will anonymise your bracket within 72 hours.',
  },
];

export default function HowToPlayPage() {
  return (
    <>
      <Header />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-sportstar-text)] mb-2">
            Sportstar · WC 2026 Bracket
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-primary)] mb-3">How to play</h1>
          <p className="text-[var(--color-text-secondary)] leading-relaxed max-w-xl">
            Everything you need to know to build a smart bracket, understand the scoring,
            and climb the Sportstar leaderboard.
          </p>
        </div>

        {/* Format explainer */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">The 2026 format</h2>
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-ink-800)] p-5 space-y-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            <p>
              FIFA World Cup 2026 is the first edition with <strong className="text-[var(--color-text-primary)]">48 teams</strong>,
              hosted across the USA, Canada, and Mexico, with the final at MetLife Stadium in New Jersey
              on <strong className="text-[var(--color-text-primary)]">19 July 2026</strong>.
            </p>
            <p>
              Teams are drawn into <strong className="text-[var(--color-text-primary)]">12 groups of 4</strong> (Groups A–L).
              Each team plays 3 group-stage matches. The top 2 from each group advance automatically
              (24 teams). The 8 best 3rd-placed teams also advance — giving 32 teams in the knockout.
            </p>
            <p>
              The knockout runs: <strong className="text-[var(--color-text-primary)]">Round of 32 → Round of 16 →
              Quarter-finals → Semi-finals → 3rd Place Playoff + Final</strong>.
              Total: 104 matches.
            </p>
          </div>
        </section>

        {/* What you predict */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">What you predict</h2>
          <div className="space-y-3">
            {[
              { n: 1, title: 'Group rankings', body: 'Rank all 4 teams in all 12 groups from 1st to 4th. Your top 2 automatically fill the Round of 32 bracket.' },
              { n: 2, title: 'Knockout winners', body: 'Pick the winner of every match from the Round of 32 through the Final (31 matches). Your bracket auto-populates from your group picks.' },
              { n: 3, title: '3rd Place Playoff', body: 'Pick the winner of the 3rd-place match — worth a dedicated 200-point bonus.' },
              { n: 4, title: 'Tiebreakers', body: 'Pick which team the Golden Boot top scorer plays for (+150 pts exact), and how many goals are scored in the Final (+100 exact, +50 if off by 1).' },
            ].map(s => (
              <div key={s.n} className="flex gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-ink-800)] p-4">
                <span className="h-7 w-7 rounded-full bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)] text-sm font-bold
                                 flex items-center justify-center shrink-0 mt-0.5">
                  {s.n}
                </span>
                <div>
                  <p className="font-semibold text-[var(--color-text-primary)] mb-1">{s.title}</p>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Scoring */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Scoring</h2>
          <div className="rounded-xl border border-[var(--color-line)] overflow-hidden mb-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-ink-800)] border-b border-[var(--color-line)]">
                  <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wide">Stage</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wide">Points</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wide hidden sm:table-cell">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line-dim)]">
                {SCORING_TABLE.map(r => (
                  <tr key={r.stage} className="hover:bg-[var(--color-ink-800)] transition-colors">
                    <td className="px-4 py-3 text-[var(--color-text-primary)]">{r.stage}</td>
                    <td className="px-4 py-3 text-right font-bold text-[var(--color-gold)] tabular-nums">+{r.pts}</td>
                    <td className="px-4 py-3 text-right text-[var(--color-text-muted)] text-xs hidden sm:table-cell">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            Maximum possible score: approx. 4,500+ points.
            Points roughly double each knockout round so late upsets can flip the leaderboard.
          </p>
        </section>

        {/* Lock */}
        <section className="mb-10 rounded-xl border border-[var(--color-sportstar)]/30
                            bg-[var(--color-sportstar)]/5 p-5">
          <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
            🔒 The lock
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            All brackets lock the moment the first match of the tournament kicks off —
            <strong className="text-[var(--color-text-primary)]"> 11 June 2026, 20:00 IST</strong>.
            After lock, no changes are possible. You can edit your submitted bracket any number of
            times before the lock. Your draft is auto-saved every time you make a pick.
          </p>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-5">FAQ</h2>
          <div className="space-y-4">
            {FAQ.map(item => (
              <details key={item.q} className="group rounded-xl border border-[var(--color-line)]
                                               bg-[var(--color-ink-800)] overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer
                                    text-sm font-semibold text-[var(--color-text-primary)] list-none gap-3
                                    hover:bg-[var(--color-ink-700)] transition-colors">
                  {item.q}
                  <span className="text-[var(--color-text-muted)] group-open:rotate-180 transition-transform shrink-0">▾</span>
                </summary>
                <div className="px-5 pb-4 text-sm text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-line)]
                                pt-3">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/build"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-bold
                       bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)] hover:bg-[var(--color-sportstar-dim)] transition-colors"
          >
            <Trophy className="h-5 w-5" /> Build my bracket
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
