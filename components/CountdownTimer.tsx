'use client';
import { useEffect, useState } from 'react';
import { LOCK_AT } from '@/data/bracket';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(): TimeLeft | null {
  const diff = LOCK_AT.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000)  /    60_000),
    seconds: Math.floor((diff % 60_000)     /     1_000),
  };
}

interface CountdownTimerProps {
  variant?: 'large' | 'compact';
}

export default function CountdownTimer({ variant = 'large' }: CountdownTimerProps) {
  const [time, setTime] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(calcTimeLeft());
    const id = setInterval(() => setTime(calcTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return null;

  if (!time) {
    return (
      <span className={variant === 'compact' ? 'text-xs text-[var(--color-sportstar)] font-semibold' : ''}>
        🔒 Bracket locked
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <span className="text-xs text-[var(--color-text-secondary)]">
        Locks in{' '}
        <span className="text-[var(--color-text-primary)] font-semibold">
          {time.days}d {time.hours}h {time.minutes}m
        </span>
      </span>
    );
  }

  const parts = [
    { value: time.days,    label: 'Days' },
    { value: time.hours,   label: 'Hrs' },
    { value: time.minutes, label: 'Min' },
    { value: time.seconds, label: 'Sec' },
  ];

  return (
    <div className="flex items-end gap-3">
      {parts.map((p, i) => (
        <div key={p.label} className="flex items-end gap-1">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] tabular-nums leading-none">
              {String(p.value).padStart(2, '0')}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-widest
                            text-[var(--color-text-muted)] mt-0.5">
              {p.label}
            </div>
          </div>
          {i < 3 && (
            <span className="text-2xl font-bold text-[var(--color-text-muted)] mb-5 leading-none">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
