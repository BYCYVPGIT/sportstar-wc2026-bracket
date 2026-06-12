# Sign-up Modal on Submit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show an email-collection modal when the user clicks "Lock & submit my bracket" — the bracket is only saved after the user provides their email.

**Architecture:** A new `SignUpModal` React component intercepts the submit action. The Review screen's submit button opens the modal instead of saving directly. The modal collects email, calls `store.submitBracket(email)`, then fires `POST /api/send-confirmation` to email the user their bracket link via Resend.

**Tech Stack:** Next.js 16 App Router, Zustand v5, Supabase, Resend (email API), TypeScript, Tailwind CSS v4

---

## File Map

| File | Action | What changes |
|------|--------|--------------|
| `types/index.ts` | Modify | Add `email?: string` to `BracketState` |
| `lib/store.ts` | Modify | `submitBracket(email)` accepts + stores email, passes it in POST body |
| `app/api/brackets/route.ts` | Modify | Accept `email` in body, save to Supabase |
| `supabase/schema.sql` | Modify | Add `email text` column to `bracket_submissions` |
| `components/SignUpModal.tsx` | Create | The modal component |
| `app/build/page.tsx` | Modify | `ReviewStep` opens modal instead of calling `onSubmit` directly |
| `app/api/send-confirmation/route.ts` | Create | POST: sends confirmation email via Resend |
| `.env.local.example` | Modify | Add `RESEND_API_KEY` |

---

## Task 1: Install Resend + add env var

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `.env.local.example`

- [ ] **Step 1: Install Resend SDK**

```bash
cd "/Users/venkataprasad/Documents/Cursor:Antigravity/Football Bracket/bracket-app"
npm install resend
```

Expected: `added 1 package` (or similar)

- [ ] **Step 2: Add RESEND_API_KEY to env template**

In `.env.local.example`, add after `CRON_SECRET=...`:

```
RESEND_API_KEY=re_your_resend_api_key_here
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json .env.local.example
git commit -m "feat: install resend for confirmation emails"
```

---

## Task 2: Add email column to Supabase + schema

**Files:**
- Modify: `supabase/schema.sql`

- [ ] **Step 1: Run this SQL in the Supabase SQL Editor**

```sql
ALTER TABLE bracket_submissions ADD COLUMN IF NOT EXISTS email text;
```

Go to your Supabase project → SQL Editor → New query → paste → Run.

- [ ] **Step 2: Update schema.sql to include the column**

In `supabase/schema.sql`, change the `bracket_submissions` table block. Find:

```sql
  updated_at     timestamptz not null default now()
);
```

Replace with:

```sql
  updated_at     timestamptz not null default now(),
  email          text
);
```

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add email column to bracket_submissions"
```

---

## Task 3: Add email to types and store

**Files:**
- Modify: `types/index.ts`
- Modify: `lib/store.ts`

- [ ] **Step 1: Add `email` to BracketState in `types/index.ts`**

Find `BracketState` (line 61) and add `email` field:

```typescript
export interface BracketState {
  displayName: string;
  email:       string;           // ← add this line
  status: 'empty' | 'draft' | 'submitted';
  currentStep: BuildStep;
  groupRanks: GroupRanks;
  knockoutPicks: KnockoutPicks;
  tiebreakers: Tiebreakers;
  submittedAt?: string;
  shortCode?: string;
}
```

- [ ] **Step 2: Add `setEmail` action to `BracketStore` interface in `lib/store.ts`**

Find the `interface BracketStore extends BracketState {` block and add:

```typescript
  setEmail: (email: string) => void;
```

after `setDisplayName`.

- [ ] **Step 3: Add `email` to `initialState` in `lib/store.ts`**

Find:
```typescript
const initialState: BracketState = {
  displayName: '',
  status: 'empty',
```

Replace with:
```typescript
const initialState: BracketState = {
  displayName: '',
  email:       '',
  status: 'empty',
```

- [ ] **Step 4: Add `setEmail` implementation + update `submitBracket` in `lib/store.ts`**

Find `setDisplayName: (name) => set({ displayName: name, status: 'draft' }),` and add after it:

```typescript
setEmail: (email) => set({ email }),
```

Then find `submitBracket: () => {` and replace the entire function with:

```typescript
submitBracket: (email: string) => {
  const state       = get();
  const shortCode   = state.shortCode ?? generateShortCode();
  const submittedAt = new Date().toISOString();

  set({ status: 'submitted', submittedAt, shortCode, email });

  fetch('/api/brackets', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shortCode,
      displayName:   state.displayName,
      email,
      groupRanks:    state.groupRanks,
      knockoutPicks: state.knockoutPicks,
      tiebreakers:   state.tiebreakers,
      submittedAt,
    }),
  }).catch(err => console.error('[bracket:submit]', err));
},
```

Also update the `BracketStore` interface — change:
```typescript
submitBracket: () => void;
```
to:
```typescript
submitBracket: (email: string) => void;
```

- [ ] **Step 5: TypeScript check**

```bash
cd "/Users/venkataprasad/Documents/Cursor:Antigravity/Football Bracket/bracket-app"
./node_modules/.bin/tsc --noEmit 2>&1 | head -30
```

Expected: no errors (or only pre-existing warnings)

- [ ] **Step 6: Commit**

```bash
git add types/index.ts lib/store.ts
git commit -m "feat: add email to BracketState and submitBracket(email)"
```

---

## Task 4: Update POST /api/brackets to save email

**Files:**
- Modify: `app/api/brackets/route.ts`

- [ ] **Step 1: Accept email in request body**

Replace the `body` type definition (lines 8–15):

```typescript
const body = await request.json() as {
  shortCode:     string;
  displayName:   string;
  email:         string;
  groupRanks:    GroupRanks;
  knockoutPicks: KnockoutPicks;
  tiebreakers:   Tiebreakers;
  submittedAt:   string;
};

const { shortCode, displayName, email, groupRanks, knockoutPicks, tiebreakers, submittedAt } = body;
```

- [ ] **Step 2: Pass email to Supabase upsert**

In the `.upsert(` call, add `email` after `display_name`:

```typescript
.upsert(
  {
    short_code:     shortCode,
    display_name:   displayName,
    email:          email ?? null,
    group_ranks:    groupRanks,
    knockout_picks: knockoutPicks,
    tiebreakers,
    score,
    submitted_at:   submittedAt,
    updated_at:     new Date().toISOString(),
  },
  { onConflict: 'short_code' },
);
```

- [ ] **Step 3: TypeScript check**

```bash
./node_modules/.bin/tsc --noEmit 2>&1 | head -30
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add app/api/brackets/route.ts
git commit -m "feat: save email to Supabase on bracket submission"
```

---

## Task 5: Create POST /api/send-confirmation

**Files:**
- Create: `app/api/send-confirmation/route.ts`

- [ ] **Step 1: Create the route file**

```typescript
// app/api/send-confirmation/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, displayName, shortCode, champion } = await request.json() as {
      email:       string;
      displayName: string;
      shortCode:   string;
      champion:    string; // team name e.g. "England"
    };

    if (!email || !shortCode) {
      return NextResponse.json({ error: 'email and shortCode are required' }, { status: 400 });
    }

    const bracketUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://sportstar-wc2026-bracket.vercel.app'}/b/${shortCode}`;

    const { error } = await resend.emails.send({
      from:    'Sportstar WC 2026 <bracket@sportstar-wc2026-bracket.vercel.app>',
      to:      email,
      subject: `Your WC 2026 bracket is locked 🏆`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#111;margin-bottom:4px">Bracket locked, ${displayName}! 🎉</h2>
          <p style="color:#555;margin-bottom:24px">
            Your FIFA World Cup 2026 bracket prediction has been saved.
            ${champion ? `Your champion pick: <strong>${champion}</strong>.` : ''}
          </p>
          <a href="${bracketUrl}"
             style="display:inline-block;background:#c8102e;color:#fff;
                    font-weight:700;padding:12px 24px;border-radius:8px;
                    text-decoration:none;font-size:15px">
            View my bracket →
          </a>
          <p style="color:#888;font-size:12px;margin-top:24px">
            Your bracket code: <strong>${shortCode}</strong><br>
            Scores update after every match. Check the
            <a href="https://sportstar-wc2026-bracket.vercel.app/leaderboard" style="color:#c8102e">
              leaderboard
            </a> to see how you rank.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[send-confirmation]', error);
      // Don't fail the request — bracket is already saved
      return NextResponse.json({ sent: false, error: error.message });
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error('[send-confirmation]', err);
    return NextResponse.json({ sent: false, error: String(err) });
  }
}
```

- [ ] **Step 2: TypeScript check**

```bash
./node_modules/.bin/tsc --noEmit 2>&1 | head -30
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/api/send-confirmation/route.ts
git commit -m "feat: POST /api/send-confirmation sends bracket link via Resend"
```

---

## Task 6: Create SignUpModal component

**Files:**
- Create: `components/SignUpModal.tsx`

- [ ] **Step 1: Create the component**

```typescript
// components/SignUpModal.tsx
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
                      border border-[var(--color-line)] shadow-2xl overflow-hidden
                      animate-in fade-in slide-in-from-bottom-4 duration-200">

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
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Check <span className="font-semibold text-[var(--color-text-primary)]">{email}</span>
                {' '}for your bracket link.
              </p>
              <button
                onClick={onClose}
                className="mt-2 w-full rounded-lg py-3 text-sm font-bold
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
                  <> Your champion pick: <span className="font-semibold text-[var(--color-text-primary)]">{championName}</span>.</>
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
              {error && (
                <p className="text-xs text-red-400 mb-3">{error}</p>
              )}
              {!error && <div className="mb-4" />}

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
                No password. No spam.
                We&apos;ll email you your bracket link so you can track your score.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
./node_modules/.bin/tsc --noEmit 2>&1 | head -30
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/SignUpModal.tsx
git commit -m "feat: add SignUpModal component"
```

---

## Task 7: Wire modal into ReviewStep in app/build/page.tsx

**Files:**
- Modify: `app/build/page.tsx`

- [ ] **Step 1: Add imports at the top of the file**

Add after the existing imports:

```typescript
import SignUpModal from '@/components/SignUpModal';
import { TEAMS_BY_ID } from '@/data/teams';
```

(Note: `TEAMS_BY_ID` is already imported — skip if present.)

- [ ] **Step 2: Replace the `ReviewStep` component**

Find the entire `ReviewStep` function (from `function ReviewStep({` to its closing `}`) and replace it with:

```typescript
function ReviewStep({
  onReset,
}: {
  onReset: () => void;
}) {
  const { groupRanks, knockoutPicks, status, shortCode, displayName, submittedAt } =
    useBracketStore();
  const submitBracket = useBracketStore(s => s.submitBracket);
  const complete  = isBracketComplete(groupRanks, knockoutPicks);
  const champion  = knockoutPicks['FINAL'] ?? null;

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

  // ── Submitted state ──────────────────────────────────────────────────────────
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

  // ── Pre-submit review ────────────────────────────────────────────────────────
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
```

- [ ] **Step 3: Update `ReviewStep` usage in `BuildPage`**

Find the `case 'review':` block (near line 575) and update it — remove `onSubmit` prop, keep only `onReset`:

```typescript
case 'review':
  return (
    <ReviewStep
      onReset={() => { store.resetBracket(); setStep('welcome'); }}
    />
  );
```

- [ ] **Step 4: TypeScript check**

```bash
./node_modules/.bin/tsc --noEmit 2>&1 | head -30
```

Expected: no errors

- [ ] **Step 5: Manual smoke test**

```
1. Open http://localhost:3031/build
2. Enter a display name → click Build my bracket
3. Rank all 12 groups
4. Fill all bracket picks
5. Set tiebreakers
6. On Review screen, click "Lock & submit my bracket"
7. Confirm: modal appears (no bracket saved yet)
8. Close modal with ✕ — confirm nothing is saved (status still 'draft')
9. Open modal again, enter email@test.com, click Lock & submit
10. Confirm: success screen appears inside modal
11. Close modal — confirm: "Bracket locked! 🎉" screen shows
```

- [ ] **Step 6: Commit**

```bash
git add app/build/page.tsx
git commit -m "feat: ReviewStep opens sign-up modal before saving bracket"
```

---

## Task 8: Set RESEND_API_KEY + final deploy

**Files:**
- `.env.local` (local only, never committed)

- [ ] **Step 1: Get your Resend API key**

1. Go to [resend.com](https://resend.com) → sign up with GitHub (free)
2. Click **API Keys** → **Create API Key**
3. Name: `sportstar-wc2026`, Permission: **Sending access**
4. Copy the key (starts with `re_`)

- [ ] **Step 2: Add to local `.env.local`**

```bash
echo "RESEND_API_KEY=re_YOUR_KEY_HERE" >> "/Users/venkataprasad/Documents/Cursor:Antigravity/Football Bracket/bracket-app/.env.local"
```

- [ ] **Step 3: Add to Vercel**

```bash
cd "/Users/venkataprasad/Documents/Cursor:Antigravity/Football Bracket/bracket-app"
echo "re_YOUR_KEY_HERE" | npx vercel env add RESEND_API_KEY production --scope venkat-s-projects2410
```

- [ ] **Step 4: Push main + redeploy**

```bash
git push origin main
npx vercel --yes --scope venkat-s-projects2410
```

- [ ] **Step 5: Final TypeScript check**

```bash
./node_modules/.bin/tsc --noEmit 2>&1 | head -30
```

Expected: no errors
