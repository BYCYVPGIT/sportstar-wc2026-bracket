'use client';
import { useState } from 'react';
import { TEAMS_BY_ID } from '@/data/teams';

interface SignUpModalProps {
  isOpen:      boolean;
  onClose:     () => void;
  onSubmit:    (email: string) => Promise<void>;
  displayName: string;
  champion:    string | null; // team ID
}

export default function SignUpModal({
  isOpen,
  onClose,
  onSubmit,
  displayName,
  champion,
}: SignUpModalProps) {
  const [email,   setEmail]   = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  if (!isOpen) return null;

  const championName = champion && TEAMS_BY_ID[champion]
    ? `${TEAMS_BY_ID[champion].flag} ${TEAMS_BY_ID[champion].name}`
    : null;

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    await onSubmit(trimmed);
    setLoading(false);
    setDone(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-[var(--color-ink-800)]
                      border border-[var(--color-line)] shadow-2xl overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[var(--color-sportstar)] to-[var(--color-gold)]" />

        <div className="p-8">
          {/* Close button */}
          {!done && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center
                         bg-[var(--color-ink-700)] text-[var(--color-text-muted)]
                         hover:text-[var(--color-text-primary)] transition-colors text-sm"
            >
              ✕
            </button>
          )}

          {done ? (
            /* ── Success state ── */
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-extrabold text-[var(--color-text-primary)] mb-2">
                Bracket locked!
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                Check{' '}
                <span className="font-semibold text-[var(--color-text-primary)]">{email}</span>
                {' '}for your bracket link.
              </p>
              <button
                onClick={onClose}
                className="w-full rounded-lg py-3 text-sm font-bold
                           bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)]
                           hover:bg-[var(--color-sportstar-dim)] transition-colors"
              >
                See my bracket →
              </button>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="text-4xl mb-3">🏆</div>
              <h2 className="text-2xl font-extrabold text-[var(--color-text-primary)] mb-2 leading-tight">
                Almost there,<br />{displayName}!
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
                Enter your email to lock in your bracket.
                {championName && (
                  <> Your champion pick:{' '}
                    <span className="font-semibold text-[var(--color-text-primary)]">{championName}</span>.
                  </>
                )}
              </p>

              <label className="block text-xs font-semibold uppercase tracking-wider
                                text-[var(--color-text-muted)] mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="you@example.com"
                autoFocus
                className={[
                  'w-full rounded-lg px-4 py-3 text-sm mb-1',
                  'bg-[var(--color-ink-700)] text-[var(--color-text-primary)]',
                  'placeholder-[var(--color-text-muted)]',
                  'border focus:outline-none transition-colors',
                  error
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-[var(--color-gold)] focus:border-[var(--color-gold)]',
                ].join(' ')}
              />
              {error
                ? <p className="text-xs text-red-400 mb-4">{error}</p>
                : <div className="mb-4" />
              }

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-lg py-3.5 text-sm font-bold transition-colors
                           bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)]
                           hover:bg-[var(--color-sportstar-dim)]
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Locking bracket…' : '🔒 Lock & submit my bracket'}
              </button>

              <p className="text-xs text-[var(--color-text-muted)] text-center mt-4 leading-relaxed">
                No password. No spam.{' '}
                We&apos;ll email you your bracket link so you can track your score.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
