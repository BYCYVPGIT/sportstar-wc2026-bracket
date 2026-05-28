import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-line)] bg-[var(--color-ink-900)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          {/* Brand */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-sportstar)] mb-1">
              Sportstar
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              FIFA World Cup 2026 Bracket Challenge
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              © {new Date().getFullYear()} The Hindu Group. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-5 gap-y-1.5">
            {[
              { label: 'How to Play', href: '/how-to-play' },
              { label: 'Leaderboard', href: '/leaderboard' },
              { label: 'Terms & Conditions', href: '/terms' },
              { label: 'Privacy Policy', href: '/privacy' },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-6 text-[11px] text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
          This is a free-to-play prediction game for entertainment purposes only. It is not
          gambling. Sportstar and The Hindu Group do not endorse betting on football matches.
          No purchase necessary. No cash prizes.
        </p>
      </div>
    </footer>
  );
}
