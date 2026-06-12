# Sign-up Modal on Bracket Submit — Design Spec

## Goal
Collect the user's email address at the moment they submit their bracket, so we can send them their bracket link and score updates during the tournament.

## Architecture
A client-side modal (React component) that appears when the user clicks "Lock & submit my bracket" on the Review screen. The email is collected, the bracket is submitted to Supabase (fire-and-forget as before), and a confirmation email is dispatched via Resend (email API). No password, no account verification — submission is instant.

## Tech Stack
- React modal component (no external library — pure Tailwind + state)
- Resend (email sending) — free tier covers 3,000 emails/month
- Supabase — `email` column added to `bracket_submissions` table
- Vercel environment variable: `RESEND_API_KEY`

---

## User Flow

```
Review screen
    ↓
User clicks "Lock & submit my bracket"
    ↓
Modal slides up (backdrop blur)
    ↓
User enters email → clicks "Lock & submit" in modal
    ↓
[Only now does the bracket save]
  • submitBracket(email) called — saves to localStorage + POST to Supabase with email
  • Confirmation email sent via Resend
    ↓
Modal shows success: "Bracket locked! Check your email."
    ↓
User closes modal → sees the existing "Bracket locked! 🎉" screen
```

**Key constraint:** The bracket is NOT saved until the user provides their email in the modal.
The "Lock & submit" button on the Review screen opens the modal only — it does NOT trigger saving.

---

## Modal Design

### Trigger
- Button: "Lock & submit my bracket" on the Review screen (`ReviewStep` component in `app/build/page.tsx`) **opens the modal only** — does NOT save the bracket
- Only shown when bracket is complete (`isBracketComplete` returns true)
- The actual `submitBracket(email)` is called by the modal's submit button after email is collected

### Modal content
- Personalised title: **"Almost there, [displayName]!"**
- Subtitle: "Enter your email to lock in your bracket. We'll send you your bracket link and score updates as the tournament progresses."
- **One field**: Email address (type="email", required)
- Button: "🔒 Lock & submit my bracket"
- Fine print: "No password. No spam. By submitting you agree to the Terms & Conditions."
- Info row: "What happens next? Bracket locked instantly. We'll email you a link to check your score."
- Close button (✕) — dismisses without submitting
- Click outside (backdrop) — dismisses without submitting

### Validation
- Email must be non-empty and contain `@`
- On invalid: red border + "Please enter a valid email address"

### Visual
- Dark modal (`#1a1e2e`) centred on a blurred backdrop
- 3px top gradient accent (red → gold, matching Sportstar brand)
- Slide-up animation on open

---

## Success State
After submitting, the modal content switches to a success view:
- 🎉 emoji
- "Bracket locked!"
- "Check [email] for your bracket link."
- Bracket short code displayed

Modal auto-closes after 2.5 seconds, revealing the existing "Bracket locked!" success screen underneath.

---

## Backend Changes

### 1. Supabase schema
Add `email` column to `bracket_submissions`:
```sql
ALTER TABLE bracket_submissions ADD COLUMN IF NOT EXISTS email text;
```

### 2. POST /api/brackets
Accept `email` in the request body, store it in Supabase.

### 3. POST /api/send-confirmation (new route)
Called after bracket is saved. Sends email via Resend with:
- Subject: "Your Sportstar WC 2026 bracket is locked 🏆"
- Body: bracket link (`/b/[shortCode]`), display name, champion pick

### 4. Environment variable
`RESEND_API_KEY` — added to `.env.local` and Vercel project settings

---

## What Does NOT Change
- The Welcome screen (display name collection stays as-is)
- The bracket building flow (Groups → Bracket → Tiebreakers → Review)
- localStorage as source of truth
- The existing success screen after submission
- The leaderboard and public bracket share page

---

## Out of Scope
- Email login / magic links for returning users
- Password authentication
- Score update emails (future feature — infrastructure is in place)
- Unsubscribe flow
