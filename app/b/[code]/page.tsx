import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BracketSummary from '@/components/BracketSummary';
import { Trophy, Share2 } from 'lucide-react';
import type { GroupRanks, KnockoutPicks } from '@/types';

interface BracketData {
  shortCode:     string;
  displayName:   string;
  groupRanks:    GroupRanks;
  knockoutPicks: KnockoutPicks;
  tiebreakers:   { goldenBootTeam: string; finalTotalGoals: number };
  score:         number;
  submittedAt:   string;
}

async function getBracket(code: string): Promise<BracketData | null> {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3031';
    const res = await fetch(`${base}/api/brackets/${code}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ code: string }> },
): Promise<Metadata> {
  const { code }  = await params;
  const bracket   = await getBracket(code);
  const name      = bracket?.displayName ?? `Bracket ${code}`;
  return {
    title:       `${name} — Sportstar WC 2026`,
    description: 'View this World Cup 2026 bracket prediction on Sportstar.',
    openGraph: {
      title:  `WC 2026 Bracket — ${name}`,
      images: [`/og/bracket/${code}.png`],
    },
  };
}

export default async function PublicBracketPage(
  { params }: { params: Promise<{ code: string }> },
) {
  const { code }  = await params;
  const bracket   = await getBracket(code);

  return (
    <>
      <Header />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12">

        {/* Bracket code chip */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)]
                          bg-[var(--color-ink-800)] px-4 py-1.5 mb-4">
            <span className="text-xs font-mono text-[var(--color-text-muted)]">Bracket</span>
            <span className="text-sm font-bold text-[var(--color-text-primary)] font-mono">{code}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] mb-1">
            {bracket ? bracket.displayName : 'World Cup 2026 Bracket'}
          </h1>
          {bracket && (
            <p className="text-sm text-[var(--color-text-secondary)]">
              Score:{' '}
              <span className="font-bold text-[var(--color-text-primary)]">
                {bracket.score.toLocaleString()} pts
              </span>
              {' · '}
              Submitted{' '}
              {new Date(bracket.submittedAt).toLocaleDateString('en-IN', {
                timeZone: 'Asia/Kolkata',
                day:      'numeric',
                month:    'short',
                year:     'numeric',
              })}
            </p>
          )}
        </div>

        {bracket ? (
          /* Show the actual bracket */
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink-800)] p-6 mb-8 overflow-x-auto">
            <BracketSummary
              groupRanks={bracket.groupRanks}
              knockoutPicks={bracket.knockoutPicks}
              champion={bracket.knockoutPicks['FINAL'] ?? null}
            />
          </div>
        ) : (
          /* Bracket not found */
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink-800)] p-8 mb-8 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
              Bracket not found
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto">
              This bracket code doesn&apos;t exist or hasn&apos;t been submitted yet.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg
                       px-5 py-3 text-sm font-semibold border border-[var(--color-line)]
                       text-[var(--color-text-primary)] hover:bg-[var(--color-ink-700)] transition-colors"
          >
            <Share2 className="h-4 w-4" /> Share this bracket
          </button>
          <Link
            href="/build"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg
                       px-5 py-3 text-sm font-bold bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)]
                       hover:bg-[var(--color-sportstar-dim)] transition-colors"
          >
            <Trophy className="h-4 w-4" /> Build my own bracket
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
