import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = { title: 'Terms & Conditions — Sportstar WC 2026 Bracket' };

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] mb-2">Terms &amp; Conditions</h1>
        <p className="text-xs text-[var(--color-text-muted)] mb-8">Last updated: 25 May 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[var(--color-text-secondary)] leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-2">1. Nature of the game</h2>
            <p>The Sportstar FIFA World Cup 2026 Bracket Challenge (&ldquo;the Contest&rdquo;) is a free-to-play
              prediction game offered for entertainment purposes only. No purchase is necessary to enter.
              The Contest does not constitute gambling or betting in any form.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-2">2. Eligibility</h2>
            <p>Open to individuals aged 18 years or older. Employees of The Hindu Group and their immediate
              families are not eligible for prizes (if any). Void where prohibited by law.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-2">3. Entry</h2>
            <p>One bracket per email address per tournament. Duplicate entries will be merged.
              Entries must be submitted before the lock time (11 June 2026, 20:00 IST).
              Late or incomplete entries are automatically discarded.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-2">4. Prizes</h2>
            <p>No cash prizes are offered. The Hindu Group may, at its sole discretion, announce
              editorial prizes (such as subscription vouchers). Any such prizes will be announced
              on sportstar.thehindu.com and are subject to separate terms.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-2">5. Scoring &amp; results</h2>
            <p>Scores are computed automatically from official FIFA match results.
              The Hindu Group reserves the right to manually correct scoring errors.
              All scoring decisions by The Hindu Group are final.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-2">6. Conduct</h2>
            <p>Participants must not use offensive display names or attempt to manipulate the
              leaderboard through automated means. Accounts found violating these rules will be
              disqualified and removed.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-2">7. Governing law</h2>
            <p>These terms are governed by the laws of India. Any disputes are subject to the
              exclusive jurisdiction of the courts in Chennai, Tamil Nadu.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-2">8. Contact</h2>
            <p>Questions: bracket@sportstar.thehindu.com</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
