import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { computeFullScore } from '@/lib/scoring';
import type { GroupRanks, KnockoutPicks, Tiebreakers } from '@/types';

export async function POST(request: Request) {
  try {
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

    if (!shortCode?.trim() || !displayName?.trim()) {
      return NextResponse.json(
        { error: 'shortCode and displayName are required' },
        { status: 400 },
      );
    }

    const supabase = createServerClient();

    // Fetch current tournament results to compute an initial score
    const { data: results } = await supabase
      .from('tournament_results')
      .select('group_standings, knockout_results, golden_boot_team, final_total_goals')
      .eq('season', '2026')
      .single();

    const score = computeFullScore(
      groupRanks    ?? {},
      knockoutPicks ?? {},
      tiebreakers   ?? { goldenBootTeam: '', finalTotalGoals: 5 },
      {
        groupStandings:  (results?.group_standings  ?? {}) as any,
        knockoutResults: (results?.knockout_results ?? {}) as Record<string, string>,
        goldenBootTeam:  results?.golden_boot_team  ?? undefined,
        finalTotalGoals: results?.final_total_goals ?? undefined,
      },
    ).total;

    const { error } = await supabase
      .from('bracket_submissions')
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

    if (error) {
      console.error('[POST /api/brackets]', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ shortCode, score });
  } catch (err) {
    console.error('[POST /api/brackets]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
