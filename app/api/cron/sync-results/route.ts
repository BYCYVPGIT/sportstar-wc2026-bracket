import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  fetchFinishedMatches,
  fetchGroupStandings,
  resolveSlotCode,
} from '@/lib/football-data';
import { computeFullScore } from '@/lib/scoring';

// Required so Next.js doesn't cache this route
export const dynamic = 'force-dynamic';

// Process earlier rounds first so their results feed later-round resolution
const STAGE_ORDER = ['r32', 'r16', 'qf', 'sf', 'final', 'third'];

export async function GET(request: Request) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabase = createServerClient();

  try {
    // ── 1. Fetch from football-data.org ──────────────────────────────────────
    const [finishedMatches, groupStandings] = await Promise.all([
      fetchFinishedMatches(),
      fetchGroupStandings(),
    ]);

    // ── 2. Load existing knockout results from DB ─────────────────────────────
    //      Later-round slots need earlier-round results already recorded
    const { data: existing } = await supabase
      .from('tournament_results')
      .select('knockout_results, golden_boot_team, final_total_goals')
      .eq('season', '2026')
      .single();

    const knockoutResults: Record<string, string> = {
      ...(existing?.knockout_results ?? {}),
    };

    // ── 3. Resolve each match → slotCode ─────────────────────────────────────
    const sorted = [...finishedMatches].sort(
      (a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage),
    );

    let matchesProcessed = 0;
    for (const match of sorted) {
      const slotCode = resolveSlotCode(match, groupStandings, knockoutResults);
      if (slotCode) {
        knockoutResults[slotCode] = match.winnerId;
        matchesProcessed++;
      }
    }

    // ── 4. Upsert tournament_results ─────────────────────────────────────────
    const { error: upsertErr } = await supabase
      .from('tournament_results')
      .upsert({
        season:            '2026',
        group_standings:   groupStandings,
        knockout_results:  knockoutResults,
        golden_boot_team:  existing?.golden_boot_team  ?? null,
        final_total_goals: existing?.final_total_goals ?? null,
        last_synced_at:    new Date().toISOString(),
      });

    if (upsertErr) throw upsertErr;

    // ── 5. Rescore all brackets ───────────────────────────────────────────────
    const { data: brackets, error: fetchErr } = await supabase
      .from('bracket_submissions')
      .select('short_code, group_ranks, knockout_picks, tiebreakers');

    if (fetchErr) throw fetchErr;

    const now = new Date().toISOString();

    const updates = (brackets ?? []).map(b => ({
      short_code: b.short_code,
      score: computeFullScore(
        b.group_ranks    ?? {},
        b.knockout_picks ?? {},
        b.tiebreakers    ?? { goldenBootTeam: '', finalTotalGoals: 5 },
        {
          groupStandings:  groupStandings as any,
          knockoutResults,
          goldenBootTeam:  existing?.golden_boot_team  ?? undefined,
          finalTotalGoals: existing?.final_total_goals ?? undefined,
        },
      ).total,
      updated_at: now,
    }));

    if (updates.length > 0) {
      const { error: scoreErr } = await supabase
        .from('bracket_submissions')
        .upsert(updates, { onConflict: 'short_code' });
      if (scoreErr) throw scoreErr;
    }

    return NextResponse.json({
      synced:           true,
      matchesProcessed,
      bracketsRescored: updates.length,
      lastSync:         now,
    });

  } catch (err) {
    console.error('[cron/sync-results]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
