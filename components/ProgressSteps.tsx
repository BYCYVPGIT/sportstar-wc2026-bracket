import type { BuildStep } from '@/types';

const STEPS: { key: BuildStep; label: string; short: string }[] = [
  { key: 'welcome',     label: 'Welcome',       short: 'Hi' },
  { key: 'groups',      label: 'Groups',         short: 'Grp' },
  { key: 'r32',         label: 'Round of 32',    short: 'R32' },
  { key: 'r16',         label: 'Round of 16',    short: 'R16' },
  { key: 'qf',          label: 'Quarter-finals', short: 'QF' },
  { key: 'sf',          label: 'Semi-finals',    short: 'SF' },
  { key: 'final',       label: 'Final',          short: 'Final' },
  { key: 'tiebreakers', label: 'Tiebreakers',    short: 'TB' },
  { key: 'review',      label: 'Review',         short: 'Rev' },
];

interface ProgressStepsProps {
  current: BuildStep;
  onJump?: (step: BuildStep) => void;
}

export default function ProgressSteps({ current, onJump }: ProgressStepsProps) {
  const currentIdx = STEPS.findIndex(s => s.key === current);
  const pct = Math.round((currentIdx / (STEPS.length - 1)) * 100);

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-[var(--color-ink-700)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--color-sportstar)] progress-fill"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Bracket ${pct}% complete`}
        />
      </div>

      {/* Step dots — hidden on xs, visible on sm+ */}
      <div className="hidden sm:flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const done    = idx < currentIdx;
          const active  = idx === currentIdx;
          const locked  = idx > currentIdx;

          return (
            <button
              key={step.key}
              onClick={() => done && onJump?.(step.key)}
              disabled={locked || !onJump}
              title={step.label}
              aria-current={active ? 'step' : undefined}
              className={[
                'flex flex-col items-center gap-1 transition-all',
                done || active ? 'cursor-pointer' : 'cursor-default',
              ].join(' ')}
            >
              <span
                className={[
                  'h-2 w-2 rounded-full transition-all',
                  active  ? 'bg-[var(--color-sportstar)] scale-150'
                  : done  ? 'bg-[var(--color-pitch)]'
                  :          'bg-[var(--color-line)]',
                ].join(' ')}
              />
              <span
                className={[
                  'text-[9px] font-semibold uppercase tracking-wide',
                  active ? 'text-[var(--color-text-primary)] font-bold' : done ? 'text-[var(--color-pitch)]' : 'text-[var(--color-text-muted)]',
                ].join(' ')}
              >
                {step.short}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile: text label */}
      <p className="sm:hidden text-xs text-[var(--color-text-secondary)] text-center">
        Step {currentIdx + 1} of {STEPS.length} — {STEPS[currentIdx]?.label}
      </p>
    </div>
  );
}
