import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Trophy, Share2 } from 'lucide-react';

// Dynamic metadata per bracket
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Bracket ${code} — Sportstar WC 2026`,
    description: 'View this World Cup 2026 bracket prediction on Sportstar.',
    openGraph: {
      title: `WC 2026 Bracket — Sportstar`,
      images: [`/og/bracket/${code}.png`],
    },
  };
}

// This page shows a shared bracket by short code.
// In production, it fetches the bracket from the DB.
// For now it shows a placeholder with a CTA to build your own.
export default async function PublicBracketPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  return (
    <>
      <Header />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Bracket code */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)]
                          bg-[var(--color-ink-800)] px-4 py-1.5 mb-4">
            <span className="text-xs font-mono text-[var(--color-text-muted)]">Bracket</span>
            <span className="text-sm font-bold text-[var(--color-text-primary)] font-mono">{code}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] mb-2">
            World Cup 2026 Bracket
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Sportstar Bracket Challenge · FIFA WC 2026
          </p>
        </div>

        {/* Placeholder bracket — replaced by live BracketSummary component once backend ready */}
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink-800)] p-8 mb-8 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
            Bracket picks are hidden until kickoff
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto leading-relaxed">
            This bracket will be revealed in full on <strong className="text-[var(--color-text-primary)]">11 June 2026</strong> when
            the tournament begins. Check back then to see the full predictions.
          </p>
        </div>

        {/* Share / Build buttons */}
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
