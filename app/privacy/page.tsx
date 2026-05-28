import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = { title: 'Privacy Policy — Sportstar WC 2026 Bracket' };

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] mb-2">Privacy Policy</h1>
        <p className="text-xs text-[var(--color-text-muted)] mb-8">Last updated: 25 May 2026</p>

        <div className="space-y-6 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-2">What we collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Email address (for magic-link authentication)</li>
              <li>Display name (shown on the leaderboard — you choose this)</li>
              <li>Bracket picks (your group and knockout predictions)</li>
              <li>Submission timestamp</li>
            </ul>
            <p className="mt-2">We do <strong className="text-[var(--color-text-primary)]">not</strong> collect your phone number,
              date of birth, address, or payment information.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-2">How we use it</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Authenticate you via a one-click magic link</li>
              <li>Display your name and score on the leaderboard</li>
              <li>Send you bracket-related emails (submission confirmation, lock reminder)</li>
              <li>If you opt in: the Sportstar football newsletter</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-2">Sharing</h2>
            <p>We do not sell your data. We may share aggregated, anonymised statistics
              (e.g. &ldquo;62% of brackets picked Brazil&rdquo;) in editorial content.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-2">Retention</h2>
            <p>Bracket data is retained as a public record for the lifetime of the product.
              Account data is retained until you request deletion.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-2">Your rights</h2>
            <p>Under India&apos;s Digital Personal Data Protection Act (DPDP) 2023 and applicable
              data protection laws, you may request access to, correction of, or deletion of
              your personal data. Email bracket@sportstar.thehindu.com with the subject line
              &ldquo;Data request&rdquo;. We will respond within 72 hours.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-2">Cookies</h2>
            <p>We use a single first-party session cookie for authentication.
              No third-party advertising cookies are set by this product.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
