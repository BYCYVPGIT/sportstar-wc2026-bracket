'use client';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { label: 'Build Bracket', href: '/build' },
  { label: 'Leaderboard',   href: '/leaderboard' },
  { label: 'How to Play',   href: '/how-to-play' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-ink-950)]">
      {/* Sportstar brand stripe */}
      <div className="h-[3px] bg-[var(--color-sportstar)]" />

      <div className="border-b border-[var(--color-line)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-13 items-center justify-between gap-4">

            {/* Wordmark */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-black tracking-[0.22em] uppercase
                                 text-[var(--color-sportstar)]">
                  Sportstar
                </span>
                <span className="text-[13px] font-bold text-[var(--color-text-primary)]
                                 tracking-tight -mt-px">
                  WC 2026 Bracket
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV.map(n => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="px-3 py-2 rounded text-sm font-medium
                             text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
                             hover:bg-[var(--color-ink-800)] transition-colors"
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            {/* CTA + mobile toggle */}
            <div className="flex items-center gap-2">
              <Link
                href="/build"
                className="hidden sm:inline-flex items-center gap-1.5 rounded px-4 py-2
                           text-sm font-bold bg-[var(--color-sportstar)]
                           text-[var(--color-on-sportstar)]
                           hover:bg-[var(--color-sportstar-dim)] transition-colors"
              >
                Pick my bracket
              </Link>
              <button
                onClick={() => setOpen(o => !o)}
                className="md:hidden p-2 rounded text-[var(--color-text-secondary)]
                           hover:text-[var(--color-text-primary)] hover:bg-[var(--color-ink-800)]
                           transition-colors"
                aria-label="Toggle menu"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <div className="md:hidden border-b border-[var(--color-line)]
                        bg-[var(--color-ink-950)] px-4 py-3 space-y-1">
          {NAV.map(n => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded text-sm font-medium
                         text-[var(--color-text-secondary)]
                         hover:text-[var(--color-text-primary)]
                         hover:bg-[var(--color-ink-800)] transition-colors"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/build"
            onClick={() => setOpen(false)}
            className="block mt-2 px-3 py-2.5 rounded text-sm font-bold text-center
                       bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)]
                       hover:bg-[var(--color-sportstar-dim)] transition-colors"
          >
            Pick my bracket
          </Link>
        </div>
      )}
    </header>
  );
}
