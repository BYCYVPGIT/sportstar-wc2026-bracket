'use client';

import { useBracketStore } from '@/lib/store';
import { resolveMatchTeams } from '@/lib/bracket';
import { TEAMS_BY_ID } from '@/data/teams';
import {
  R32_SLOTS, R16_SLOTS, QF_SLOTS, SF_SLOTS, FINAL_SLOT, THIRD_SLOT,
} from '@/data/bracket';
import type { MatchSlot } from '@/types';

// ─── Layout constants ──────────────────────────────────────────────────────────
const CW = 148;   // card width (px)
const CH = 68;    // card height (px)
const SH = 76;    // vertical slot unit — spacing for one R32 match
const CX = 40;    // connector column width
const N  = 16;    // R32 match count

const TH  = N * SH;                  // total canvas height: 1216
const COL = CW + CX;                 // column pitch: 188
const TW  = 5 * COL + CX + 120;     // canvas width: 1180 (5 rounds + champ)

// ─── Position helpers ──────────────────────────────────────────────────────────
function cardTop(mult: number, idx: number): number {
  return idx * mult * SH + (mult * SH - CH) / 2;
}
function cardCY(mult: number, idx: number): number {
  return idx * mult * SH + (mult * SH) / 2;
}
function colX(ri: number): number {
  return ri * COL;
}

// ─── SVG connector path between round ri and ri+1 ─────────────────────────────
function buildConnPath(ri: number): string {
  const mult  = Math.pow(2, ri);
  const count = N / Math.pow(2, ri + 1);
  let d = '';
  for (let j = 0; j < count; j++) {
    const y1 = cardCY(mult, 2 * j);
    const y2 = cardCY(mult, 2 * j + 1);
    const yM = (y1 + y2) / 2;
    const x1 = colX(ri) + CW;
    const xV = x1 + CX / 2;
    const x2 = colX(ri + 1);
    d += `M${x1},${y1}H${xV}M${x1},${y2}H${xV}M${xV},${y1}V${y2}M${xV},${yM}H${x2}`;
  }
  return d;
}

// ─── Round definitions ────────────────────────────────────────────────────────
const ROUNDS: Array<{
  ri: number; label: string; short: string; slots: MatchSlot[]; mult: number;
}> = [
  { ri: 0, label: 'Round of 32',    short: 'R32',   slots: R32_SLOTS,    mult: 1  },
  { ri: 1, label: 'Round of 16',    short: 'R16',   slots: R16_SLOTS,    mult: 2  },
  { ri: 2, label: 'Quarter-finals', short: 'QF',    slots: QF_SLOTS,     mult: 4  },
  { ri: 3, label: 'Semi-finals',    short: 'SF',    slots: SF_SLOTS,     mult: 8  },
  { ri: 4, label: 'Final',          short: 'Final', slots: [FINAL_SLOT], mult: 16 },
];

// ─── Single team row inside a match card ─────────────────────────────────────
function TeamRow({
  teamId,
  picked,
  canPick,
  onPick,
}: {
  teamId: string | null;
  picked: boolean;
  canPick: boolean;
  onPick: () => void;
}) {
  const team = teamId ? TEAMS_BY_ID[teamId] : null;

  return (
    <button
      type="button"
      onClick={canPick && !!teamId ? onPick : undefined}
      className={[
        'flex-1 flex items-center gap-2 px-2.5 min-w-0 w-full transition-colors duration-100 text-left',
        picked
          ? 'bg-[var(--color-gold)]/20 text-[var(--color-text-primary)]'
          : canPick && teamId
            ? 'cursor-pointer hover:bg-black/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            : 'cursor-default text-[var(--color-text-muted)]',
      ].join(' ')}
    >
      {team ? (
        <>
          <span className="text-sm leading-none shrink-0 select-none">{team.flag}</span>
          <span className="text-[11px] font-bold tracking-wide flex-1 truncate">
            {team.short}
          </span>
          {picked && (
            <span className="text-[var(--color-gold)] text-[9px] font-black shrink-0 select-none leading-none">
              ✓
            </span>
          )}
        </>
      ) : (
        <span className="text-[10px] italic text-[var(--color-text-muted)]">TBD</span>
      )}
    </button>
  );
}

// ─── Match card (absolute-positioned on canvas) ───────────────────────────────
function MatchCard({
  slot,
  ri,
  idx,
}: {
  slot: MatchSlot;
  ri: number;
  idx: number;
}) {
  const groupRanks    = useBracketStore(s => s.groupRanks);
  const knockoutPicks = useBracketStore(s => s.knockoutPicks);
  const pick          = useBracketStore(s => s.pickKnockoutWinner);

  const mult = Math.pow(2, ri);
  const [homeId, awayId] = resolveMatchTeams(slot.slotCode, groupRanks, knockoutPicks);
  const pickedId = knockoutPicks[slot.slotCode];
  const canPick  = !!(homeId && awayId);

  return (
    <div
      className={[
        'absolute flex flex-col overflow-hidden rounded-lg border transition-colors duration-150',
        pickedId
          ? 'border-[var(--color-gold)]/40 bg-[var(--color-ink-800)]'
          : canPick
            ? 'border-[var(--color-line)] bg-[var(--color-ink-800)] hover:border-[var(--color-text-muted)]'
            : 'border-[var(--color-line)]/30 bg-[var(--color-ink-900)]',
      ].join(' ')}
      style={{
        width:  CW,
        height: CH,
        top:    cardTop(mult, idx),
        left:   colX(ri),
      }}
    >
      <TeamRow
        teamId={homeId}
        picked={pickedId === homeId && !!homeId}
        canPick={canPick}
        onPick={() => homeId && pick(slot.slotCode, homeId)}
      />
      <div className="h-px shrink-0 bg-[var(--color-line)]/50" />
      <TeamRow
        teamId={awayId}
        picked={pickedId === awayId && !!awayId}
        canPick={canPick}
        onPick={() => awayId && pick(slot.slotCode, awayId)}
      />
    </div>
  );
}

// ─── Champion trophy display ───────────────────────────────────────────────────
function ChampionCard() {
  const knockoutPicks = useBracketStore(s => s.knockoutPicks);
  const champId = knockoutPicks['FINAL'];
  const champ   = champId ? TEAMS_BY_ID[champId] : null;

  const cx  = colX(5);          // 940
  const top = cardCY(16, 0);    // vertical center of Final card: 608

  return (
    <div
      className="absolute flex flex-col items-center justify-center text-center select-none"
      style={{ left: cx, top: top - 64, width: 120, height: 128 }}
    >
      <div className="text-4xl mb-1.5">{champ ? champ.flag : '🏆'}</div>
      {champ ? (
        <>
          <div className="text-[9px] font-black text-[var(--color-gold)] uppercase tracking-widest mb-0.5">
            Champion
          </div>
          <div className="text-xs font-extrabold text-[var(--color-text-primary)] leading-tight px-1">
            {champ.name}
          </div>
        </>
      ) : (
        <div className="text-[10px] text-[var(--color-text-muted)] font-medium leading-snug">
          Pick your<br />champion
        </div>
      )}
    </div>
  );
}

// ─── Third-place playoff (standalone below the tree) ──────────────────────────
function ThirdPlaceCard() {
  const groupRanks    = useBracketStore(s => s.groupRanks);
  const knockoutPicks = useBracketStore(s => s.knockoutPicks);
  const pick          = useBracketStore(s => s.pickKnockoutWinner);

  const [homeId, awayId] = resolveMatchTeams('THIRD', groupRanks, knockoutPicks);
  const pickedId = knockoutPicks['THIRD'];
  const canPick  = !!(homeId && awayId);

  return (
    <div
      className="flex flex-col overflow-hidden rounded-lg border transition-colors duration-150"
      style={{ width: CW, height: CH }}
      aria-label={THIRD_SLOT.matchLabel}
    >
      <div
        className={[
          'flex flex-col w-full h-full',
          pickedId
            ? 'border-[var(--color-gold)]/40 bg-[var(--color-ink-800)]'
            : canPick
              ? 'border-[var(--color-line)] bg-[var(--color-ink-800)]'
              : 'border-[var(--color-line)]/30 bg-[var(--color-ink-900)]',
        ].join(' ')}
      >
        <TeamRow
          teamId={homeId}
          picked={pickedId === homeId && !!homeId}
          canPick={canPick}
          onPick={() => homeId && pick('THIRD', homeId)}
        />
        <div className="h-px shrink-0 bg-[var(--color-line)]/50" />
        <TeamRow
          teamId={awayId}
          picked={pickedId === awayId && !!awayId}
          canPick={canPick}
          onPick={() => awayId && pick('THIRD', awayId)}
        />
      </div>
    </div>
  );
}

// ─── Round column headers ──────────────────────────────────────────────────────
function RoundHeaders() {
  return (
    <div className="flex mb-3 shrink-0" style={{ width: TW }}>
      {ROUNDS.map((r, i) => (
        <div
          key={r.ri}
          className="text-center text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider shrink-0"
          style={{ width: CW, marginRight: i < 4 ? CX : 0 }}
        >
          {r.label}
        </div>
      ))}
      <div
        className="text-center text-[11px] font-bold text-[var(--color-sportstar-text)] uppercase tracking-wider shrink-0"
        style={{ marginLeft: CX, width: 120 }}
      >
        Champion
      </div>
    </div>
  );
}

// ─── Main BracketTree export ──────────────────────────────────────────────────
export default function BracketTree() {
  // Pre-compute SVG paths for rounds R32→R16, R16→QF, QF→SF, SF→Final
  const connPaths = [0, 1, 2, 3].map(ri => ({ ri, d: buildConnPath(ri) }));

  // Connector from Final right-edge to champion card
  const finalCY   = cardCY(16, 0);           // 608
  const champConn = `M${colX(4) + CW},${finalCY}H${colX(5)}`;

  return (
    <div className="w-full fade-in">
      {/* Hint */}
      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        Click a team name to advance them. Work left → right to fill the bracket.
      </p>

      {/* Horizontal scroll wrapper */}
      <div className="overflow-x-auto pb-4">
        <RoundHeaders />

        {/* Canvas */}
        <div className="relative shrink-0" style={{ width: TW, height: TH }}>
          {/* SVG connector lines */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={TW}
            height={TH}
            viewBox={`0 0 ${TW} ${TH}`}
            aria-hidden="true"
          >
            {connPaths.map(({ ri, d }) => (
              <path
                key={ri}
                d={d}
                fill="none"
                stroke="var(--color-line)"
                strokeWidth={1.5}
              />
            ))}
            {/* Dashed connector to champion */}
            <path
              d={champConn}
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              opacity={0.5}
            />
          </svg>

          {/* Match cards per round */}
          {ROUNDS.map(({ ri, slots }) =>
            slots.map((slot, idx) => (
              <MatchCard key={slot.slotCode} slot={slot} ri={ri} idx={idx} />
            ))
          )}

          {/* Champion */}
          <ChampionCard />
        </div>

        {/* Third-place playoff — below bracket, aligned to SF column */}
        <div style={{ marginTop: 28, marginLeft: colX(3) }} className="shrink-0">
          <div className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            3rd Place Playoff
          </div>
          <ThirdPlaceCard />
        </div>
      </div>
    </div>
  );
}
