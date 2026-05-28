import type { Team } from '@/types';

interface TeamBadgeProps {
  team: Team;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showFlag?: boolean;
  showShort?: boolean;
  className?: string;
}

const sizeMap = {
  xs: { flag: 'text-base',    name: 'text-xs',  short: 'text-[10px]' },
  sm: { flag: 'text-lg',      name: 'text-sm',  short: 'text-xs' },
  md: { flag: 'text-2xl',     name: 'text-base',short: 'text-xs' },
  lg: { flag: 'text-4xl',     name: 'text-lg',  short: 'text-sm' },
};

export default function TeamBadge({
  team,
  size = 'sm',
  showFlag = true,
  showShort = false,
  className = '',
}: TeamBadgeProps) {
  const sz = sizeMap[size];
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {showFlag && (
        <span className={sz.flag} aria-label={`Flag of ${team.name}`} role="img">
          {team.flag}
        </span>
      )}
      <span className="flex flex-col leading-tight">
        <span className={`font-semibold text-[var(--color-text-primary)] ${sz.name}`}>{team.name}</span>
        {showShort && (
          <span className={`text-[var(--color-text-muted)] font-mono ${sz.short}`}>
            {team.short}
          </span>
        )}
      </span>
    </span>
  );
}

/** Compact pill — flag + short code, used inside bracket match cells */
export function TeamPill({
  team,
  picked,
  dimmed,
  onClick,
}: {
  team: Team | null;
  picked?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
}) {
  if (!team) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded
                      bg-[var(--color-ink-700)] border border-dashed border-[var(--color-line)]
                      text-[var(--color-text-muted)] text-xs italic">
        TBD
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      aria-pressed={picked}
      className={[
        'team-pick-btn w-full flex items-center gap-2 px-3 py-2.5 rounded-lg',
        'border transition-all duration-150',
        'text-left cursor-pointer disabled:cursor-default',
        picked
          ? 'bg-[var(--color-ink-600)] border-[var(--color-gold)] text-[var(--color-text-primary)] picked'
          : dimmed
          ? 'bg-[var(--color-ink-800)] border-transparent text-[var(--color-text-muted)] opacity-50'
          : 'bg-[var(--color-ink-700)] border-[var(--color-line)] text-[var(--color-text-primary)] hover:border-[var(--color-gold)]/50',
      ].join(' ')}
    >
      <span className="text-xl leading-none" aria-hidden="true">{team.flag}</span>
      <span className="flex-1 min-w-0">
        <span className="block font-semibold text-sm truncate">{team.name}</span>
        <span className="block text-[10px] font-mono text-[var(--color-text-muted)]">{team.short}</span>
      </span>
      {picked && (
        <span className="text-[var(--color-gold)] text-xs font-bold shrink-0">✓</span>
      )}
    </button>
  );
}
