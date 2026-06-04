import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { LeaderboardEntry } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit  = Math.min(Number(searchParams.get('limit')  ?? '50'), 100);
  const offset = Math.max(Number(searchParams.get('offset') ?? '0'),   0);

  const supabase = createServerClient();

  const { data, count, error } = await supabase
    .from('bracket_submissions')
    .select('short_code, display_name, score, submitted_at', { count: 'exact' })
    .order('score',        { ascending: false })
    .order('submitted_at', { ascending: true }) // tiebreak: earlier submission ranks higher
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[GET /api/leaderboard]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  const total = count ?? 0;

  const entries: LeaderboardEntry[] = (data ?? []).map((row, i) => {
    const rank = offset + i + 1;
    // percentile: % of all players this bracket beats
    const percentile = total > 1
      ? Math.round(((total - rank) / (total - 1)) * 100 * 10) / 10
      : 100;

    return {
      rank,
      displayName: row.display_name,
      shortCode:   row.short_code,
      score:       row.score,
      percentile,
      submittedAt: row.submitted_at,
    };
  });

  return NextResponse.json({ entries, total });
}
