import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  if (!code?.trim()) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('bracket_submissions')
    .select('short_code, display_name, group_ranks, knockout_picks, tiebreakers, score, submitted_at')
    .eq('short_code', code)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Bracket not found' }, { status: 404 });
  }

  return NextResponse.json({
    shortCode:     data.short_code,
    displayName:   data.display_name,
    groupRanks:    data.group_ranks,
    knockoutPicks: data.knockout_picks,
    tiebreakers:   data.tiebreakers,
    score:         data.score,
    submittedAt:   data.submitted_at,
  });
}
