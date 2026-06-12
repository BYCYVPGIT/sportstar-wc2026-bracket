'use client';
import { useState, useEffect, useRef } from 'react';
import { Check, Share2, RotateCcw, Trophy, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import SignUpModal from '@/components/SignUpModal';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GroupCard from '@/components/GroupCard';
import BracketTree from '@/components/BracketTree';
import BracketSummary from '@/components/BracketSummary';
import CountdownTimer from '@/components/CountdownTimer';
import { useBracketStore } from '@/lib/store';
import {
  countCompletedGroups,
  countKnockoutPicks,
  isBracketComplete,
} from '@/lib/bracket';
import { GROUP_CODES } from '@/types';
import { TEAMS_BY_ID } from '@/data/teams';

// ─── Page-level step ──────────────────────────────────────────────────────────
type PageStep = 'welcome' | 'groups' | 'bracket' | 'tiebreakers' | 'review';

const PAGE_STEPS: PageStep[] = ['welcome', 'groups', 'bracket', 'tiebreakers', 'review'];
const STEP_LABELS: Record<PageStep, string> = {
  welcome:     'Welcome',
  groups:      'Groups',
  bracket:     'Bracket',
  tiebreakers: 'Tiebreakers',
  review:      'Review',
};

// ─── Step progress pills ──────────────────────────────────────────────────────
function StepPills({
  current,
  onJump,
  groupsDone,
  bracketDone,
  tiebreakersTouched,
}: {
  current: PageStep;
  onJump: (s: PageStep) => void;
  groupsDone: boolean;
  bracketDone: boolean;
  tiebreakersTouched: boolean;
}) {
  const visible: PageStep[] = ['groups', 'bracket', 'tiebreakers', 'review'];
  const done: Partial<Record<PageStep, boolean>> = {
    groups:      groupsDone,
    bracket:     bracketDone,
    tiebreakers: tiebreakersTouched,
  };
  const reachable: Partial<Record<PageStep, boolean>> = {
    groups:      true,
    bracket:     groupsDone,
    tiebreakers: bracketDone,
    review:      bracketDone,
  };

  return (
    <div className="flex items-center gap-1.5 mb-6">
      {visible.map((step, i) => {
        const isActive = current === step;
        const isDone   = done[step];
        const canJump  = reachable[step];
        return (
          <div key={step} className="flex items-center gap-1.5">
            {i > 0 && (
              <div className="h-px w-4 bg-[var(--color-line)] shrink-0" />
            )}
            <button
              onClick={() => canJump && onJump(step)}
              disabled={!canJump}
              className={[
                'rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition-all shrink-0',
                isActive
                  ? 'bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)]'
                  : isDone
                    ? 'bg-[var(--color-pitch)]/20 text-[var(--color-pitch)] cursor-pointer'
                    : canJump
                      ? 'bg-[var(--color-ink-700)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer'
                      : 'bg-[var(--color-ink-700)]/50 text-[var(--color-text-muted)] cursor-not-allowed',
              ].join(' ')}
            >
              {isDone && !isActive ? '✓ ' : ''}{STEP_LABELS[step]}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Welcome step ─────────────────────────────────────────────────────────────
function WelcomeStep({
  displayName,
  setDisplayName,
  onNext,
}: {
  displayName: string;
  setDisplayName: (n: string) => void;
  onNext: () => void;
}) {
  const [local, setLocal] = useState(displayName);
  const [error, setError] = useState('');

  const handleNext = () => {
    const name = local.trim();
    if (!name) { setError('Enter a display name to continue.'); return; }
    if (name.length > 40) { setError('Max 40 characters.'); return; }
    setDisplayName(name);
    onNext();
  };

  return (
    <div className="fade-in max-w-lg mx-auto text-center py-8">
      <div className="text-5xl mb-4">🏆</div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] mb-2">
        FIFA World Cup 2026<br />Bracket Challenge
      </h1>
      <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
        Predict every match from group stage to the final. Lock before kickoff.
        Climb the Sportstar leaderboard.
      </p>

      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-ink-800)] p-6 mb-6 text-left">
        <label
          className="block text-xs font-semibold uppercase tracking-wider
                     text-[var(--color-text-muted)] mb-2"
          htmlFor="displayName"
        >
          Your display name
        </label>
        <input
          id="displayName"
          type="text"
          value={local}
          onChange={e => { setLocal(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleNext()}
          placeholder="e.g. Ravi from Bengaluru"
          maxLength={40}
          className="w-full rounded-lg bg-[var(--color-ink-700)] border border-[var(--color-line)]
                     text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] px-4 py-3 text-sm
                     focus:outline-none focus:border-[var(--color-gold)] transition-colors"
        />
        {error && <p className="text-xs text-[var(--color-sportstar-text)] mt-2">{error}</p>}
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          Shown on the leaderboard. No account required.
        </p>
      </div>

      <button
        onClick={handleNext}
        className="w-full rounded-lg py-3 text-base font-bold
                   bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)]
                   hover:bg-[var(--color-sportstar-dim)] transition-colors"
      >
        Build my bracket →
      </button>

      <div className="mt-6">
        <CountdownTimer variant="compact" />
      </div>
    </div>
  );
}

// ─── Groups step ──────────────────────────────────────────────────────────────
function GroupsStep({ onNext }: { onNext: () => void }) {
  const groupRanks = useBracketStore(s => s.groupRanks);
  const done = countCompletedGroups(groupRanks);
  const allDone = done >= 12;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Group Stage</h2>
        <span className="text-xs text-[var(--color-text-secondary)]">
          {done}/12 groups ranked
        </span>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        Drag ▲▼ to set your predicted standings. Top 2 advance; best 3rd-placed teams
        from Groups A–H also qualify.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {GROUP_CODES.map(g => (
          <GroupCard key={g} group={g} highlight={!groupRanks[g]} />
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-[var(--color-line)]">
        <button
          onClick={onNext}
          disabled={!allDone}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold
                     bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)]
                     hover:bg-[var(--color-sportstar-dim)] transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {allDone ? 'Fill the bracket' : `Rank all 12 groups (${done}/12)`}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Bracket step ────────────────────────────────────────────────────────────
function BracketStep({ onNext }: { onNext: () => void }) {
  const groupRanks    = useBracketStore(s => s.groupRanks);
  const knockoutPicks = useBracketStore(s => s.knockoutPicks);
  const [groupsOpen, setGroupsOpen] = useState(false);

  const koPicks  = countKnockoutPicks(knockoutPicks);
  const allDone  = koPicks >= 32;

  return (
    <div className="fade-in">
      {/* Groups summary / edit panel */}
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-ink-800)] mb-5 overflow-hidden">
        <button
          type="button"
          onClick={() => setGroupsOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3
                     text-sm font-semibold text-[var(--color-text-primary)] hover:bg-black/5 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="text-[var(--color-pitch)] text-xs font-black">✓</span>
            Groups complete — 12/12 ranked
          </span>
          {groupsOpen
            ? <ChevronUp className="h-4 w-4 text-[var(--color-text-muted)]" />
            : <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)]" />
          }
        </button>
        {groupsOpen && (
          <div className="px-4 pb-4 border-t border-[var(--color-line)]">
            <p className="text-xs text-[var(--color-text-secondary)] mt-3 mb-4">
              Changing group rankings will clear any inconsistent knockout picks.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {GROUP_CODES.map(g => (
                <GroupCard key={g} group={g} highlight={!groupRanks[g]} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-1.5 rounded-full bg-[var(--color-ink-600)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-sportstar)] progress-fill"
            style={{ width: `${Math.round((koPicks / 32) * 100)}%` }}
          />
        </div>
        <span className="text-xs text-[var(--color-text-muted)] shrink-0 tabular-nums w-20 text-right">
          {koPicks}/32 picks
        </span>
      </div>

      {/* The bracket tree */}
      <BracketTree />

      {/* Proceed */}
      <div className="flex justify-end mt-6 pt-4 border-t border-[var(--color-line)]">
        <button
          onClick={onNext}
          disabled={!allDone}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold
                     bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)]
                     hover:bg-[var(--color-sportstar-dim)] transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {allDone ? 'Set tiebreakers' : `Fill all ${32 - koPicks} remaining picks`}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Tiebreakers step ─────────────────────────────────────────────────────────
function TiebreakersStep({ onNext }: { onNext: () => void }) {
  const tiebreakers   = useBracketStore(s => s.tiebreakers);
  const knockoutPicks = useBracketStore(s => s.knockoutPicks);
  const setTiebreaker = useBracketStore(s => s.setTiebreaker);

  const finalWinnerId = knockoutPicks['FINAL'];
  const finalWinner   = finalWinnerId ? TEAMS_BY_ID[finalWinnerId] : null;
  const pickedTeams   = [...new Set(Object.values(knockoutPicks))]
    .map(id => TEAMS_BY_ID[id])
    .filter(Boolean);

  return (
    <div className="fade-in max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">Tiebreakers</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Used to break ties on the leaderboard. Both earn bonus points.
        </p>
      </div>

      {/* Golden Boot */}
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-ink-800)] p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🥾</span>
          <h3 className="font-bold text-[var(--color-text-primary)]">Golden Boot</h3>
          <span className="ml-auto text-xs font-bold text-[var(--color-gold)]">+150 pts</span>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mb-4">
          Which team do you think the Golden Boot winner plays for?
        </p>
        <select
          value={tiebreakers.goldenBootTeam}
          onChange={e => setTiebreaker('goldenBootTeam', e.target.value)}
          className="w-full rounded-lg bg-[var(--color-ink-700)] border border-[var(--color-line)]
                     text-[var(--color-text-primary)] px-3 py-2.5 text-sm
                     focus:outline-none focus:border-[var(--color-gold)] transition-colors"
        >
          <option value="">Select a team…</option>
          {pickedTeams.length > 0 ? (
            <optgroup label="Your picked teams">
              {pickedTeams.map(t => (
                <option key={t!.id} value={t!.id}>{t!.flag} {t!.name}</option>
              ))}
            </optgroup>
          ) : (
            Object.values(TEAMS_BY_ID).map(t => (
              <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
            ))
          )}
        </select>
      </div>

      {/* Final total goals */}
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-ink-800)] p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">⚽</span>
          <h3 className="font-bold text-[var(--color-text-primary)]">Final Total Goals</h3>
          <span className="ml-auto text-xs font-bold text-[var(--color-gold)]">
            +100 pts exact · +50 pts ±1
          </span>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mb-4">
          How many total goals in the Final
          {finalWinner ? ` (featuring ${finalWinner.name})` : ''}?
          (Including extra time, excluding penalties.)
        </p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={12}
            value={tiebreakers.finalTotalGoals}
            onChange={e => setTiebreaker('finalTotalGoals', Number(e.target.value))}
            className="flex-1 accent-[var(--color-sportstar)]"
          />
          <span className="text-3xl font-extrabold text-[var(--color-text-primary)] w-10 text-center tabular-nums">
            {tiebreakers.finalTotalGoals}
          </span>
        </div>
        <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-1">
          <span>0</span><span>6</span><span>12</span>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold
                     bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)]
                     hover:bg-[var(--color-sportstar-dim)] transition-colors"
        >
          <Check className="h-4 w-4" /> Review bracket
        </button>
      </div>
    </div>
  );
}

// ─── Review & submit step ────────────────────────────────────────────────────
function ReviewStep({ onReset }: { onReset: () => void }) {
  const { groupRanks, knockoutPicks, status, shortCode, displayName, submittedAt } =
    useBracketStore();
  const submitBracket = useBracketStore(s => s.submitBracket);
  const complete = isBracketComplete(groupRanks, knockoutPicks);
  const champion = knockoutPicks['FINAL'] ?? null;

  const [modalOpen, setModalOpen] = useState(false);

  const handleModalSubmit = async (email: string) => {
    submitBracket(email);
    // submitBracket calls Zustand set() synchronously — read fresh state immediately
    const fresh = useBracketStore.getState();
    const championName = champion && TEAMS_BY_ID[champion]
      ? TEAMS_BY_ID[champion].name
      : '';
    fetch('/api/send-confirmation', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        displayName: fresh.displayName,
        shortCode:   fresh.shortCode ?? '',
        champion:    championName,
      }),
    }).catch(err => console.error('[send-confirmation]', err));
  };

  // ── Submitted state ────────────────────────────────────────────────────────
  if (status === 'submitted' && shortCode) {
    return (
      <div className="fade-in max-w-lg mx-auto text-center py-8">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-extrabold text-[var(--color-text-primary)] mb-2">Bracket locked!</h2>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Good luck, {displayName}. Your picks are saved.
          Locked at{' '}
          {submittedAt
            ? new Date(submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            : ''}.
        </p>

        {champion && TEAMS_BY_ID[champion] && (
          <div className="rounded-2xl border border-[var(--color-gold)]/40
                          bg-[var(--color-ink-800)] p-6 mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest
                          text-[var(--color-gold)] mb-2">
              Your champion
            </p>
            <p className="text-4xl mb-1">{TEAMS_BY_ID[champion].flag}</p>
            <p className="champion-glow text-2xl font-extrabold">
              {TEAMS_BY_ID[champion].name}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-center rounded-lg
                          bg-[var(--color-ink-800)] border border-[var(--color-line)] px-4 py-3">
            <span className="text-xs text-[var(--color-text-muted)] font-mono">
              Your bracket code:{' '}
              <span className="text-[var(--color-text-primary)] font-bold">{shortCode}</span>
            </span>
          </div>
          <button
            onClick={() => {
              const url = `${window.location.origin}/b/${shortCode}`;
              if (navigator.share) {
                navigator.share({ title: 'My Sportstar WC 2026 Bracket', url });
              } else {
                navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
              }
            }}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold
                       border border-[var(--color-line)] text-[var(--color-text-primary)]
                       hover:bg-[var(--color-ink-700)] transition-colors"
          >
            <Share2 className="h-4 w-4" /> Share my bracket
          </button>
          <Link
            href="/leaderboard"
            className="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold
                       bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)]
                       hover:bg-[var(--color-sportstar-dim)] transition-colors"
          >
            <Trophy className="h-4 w-4" /> View leaderboard
          </Link>
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2 text-xs
                       text-[var(--color-text-muted)] hover:text-[var(--color-sportstar-text)] transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Start over
          </button>
        </div>
      </div>
    );
  }

  // ── Pre-submit review ─────────────────────────────────────────────────────
  return (
    <>
      <SignUpModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        displayName={displayName}
        champion={champion}
      />

      <div className="fade-in">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Review your bracket</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              Check everything before locking in.
            </p>
          </div>
          {complete ? (
            <span className="text-xs font-semibold text-[var(--color-pitch)]
                             bg-[var(--color-pitch)]/10 px-2.5 py-1 rounded-full shrink-0">
              Complete ✓
            </span>
          ) : (
            <span className="text-xs font-semibold text-[var(--color-gold)]
                             bg-[var(--color-gold)]/10 px-2.5 py-1 rounded-full shrink-0">
              Incomplete
            </span>
          )}
        </div>

        {!complete && (
          <div className="rounded-lg border border-[var(--color-gold)]/30
                          bg-[var(--color-gold)]/5 p-4 mb-6">
            <p className="text-sm text-[var(--color-gold)]">
              ⚠️ Your bracket isn&apos;t complete. Go back and fill all picks.
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Groups: {countCompletedGroups(groupRanks)}/12 ·
              Knockout picks: {countKnockoutPicks(knockoutPicks)}/32
            </p>
          </div>
        )}

        <BracketSummary
          groupRanks={groupRanks}
          knockoutPicks={knockoutPicks}
          champion={champion}
        />

        <div className="mt-8 pt-6 border-t border-[var(--color-line)]">
          <p className="text-xs text-[var(--color-text-muted)] mb-4 text-center">
            By submitting you agree to the{' '}
            <Link href="/terms" className="text-[var(--color-sportstar-text)] hover:underline">
              Terms &amp; Conditions
            </Link>. Your bracket is locked once submitted.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            disabled={!complete}
            className="w-full rounded-lg py-4 text-base font-bold transition-colors
                       bg-[var(--color-sportstar)] text-[var(--color-on-sportstar)]
                       hover:bg-[var(--color-sportstar-dim)]
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Lock &amp; submit my bracket
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main builder page ────────────────────────────────────────────────────────
export default function BuildPage() {
  const store = useBracketStore();
  const { displayName, groupRanks, knockoutPicks } = store;

  // Start on 'welcome'. Once Zustand rehydrates from localStorage (which fires
  // a state update causing a re-render), auto-route to the correct step once.
  const [step, setStep] = useState<PageStep>('welcome');
  const [tiebreakersTouched, setTiebreakersTouched] = useState(false);
  const autoRouted = useRef(false);

  useEffect(() => {
    if (autoRouted.current || !displayName.trim()) return;
    autoRouted.current = true;
    if (countCompletedGroups(groupRanks) < 12)  { setStep('groups');  return; }
    setStep('bracket');
  }, [displayName, groupRanks, knockoutPicks]);

  const groupsDone  = countCompletedGroups(groupRanks) >= 12;
  const bracketDone = countKnockoutPicks(knockoutPicks) >= 32;

  const goTo = (s: PageStep) => {
    if (s === 'tiebreakers') setTiebreakersTouched(true);
    setStep(s);
  };

  const stepContent = () => {
    switch (step) {
      case 'welcome':
        return (
          <WelcomeStep
            displayName={displayName}
            setDisplayName={store.setDisplayName}
            onNext={() => goTo('groups')}
          />
        );
      case 'groups':
        return <GroupsStep onNext={() => goTo('bracket')} />;
      case 'bracket':
        return <BracketStep onNext={() => goTo('tiebreakers')} />;
      case 'tiebreakers':
        return <TiebreakersStep onNext={() => goTo('review')} />;
      case 'review':
        return (
          <ReviewStep
            onReset={() => { store.resetBracket(); setStep('welcome'); }}
          />
        );
    }
  };

  return (
    <>
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Step pills — hidden on welcome screen */}
        {step !== 'welcome' && (
          <StepPills
            current={step}
            onJump={goTo}
            groupsDone={groupsDone}
            bracketDone={bracketDone}
            tiebreakersTouched={tiebreakersTouched}
          />
        )}

        {/* Step content */}
        <div className="min-h-[60vh]">
          {stepContent()}
        </div>
      </main>

      <Footer />
    </>
  );
}
