import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, displayName, shortCode, champion } = await request.json() as {
      email:       string;
      displayName: string;
      shortCode:   string;
      champion:    string;
    };

    if (!email || !shortCode) {
      return NextResponse.json({ error: 'email and shortCode are required' }, { status: 400 });
    }

    const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sportstar-wc2026-bracket.vercel.app';
    const bracketUrl = `${appUrl}/b/${shortCode}`;
    const leaderboardUrl = `${appUrl}/leaderboard`;

    const championHtml = champion
      ? `<p style="color:#555;margin-bottom:24px">Your champion pick: <strong>${champion}</strong>.</p>`
      : '';

    const { error } = await resend.emails.send({
      from:    'Sportstar WC 2026 <onboarding@resend.dev>',
      to:      email,
      subject: `Your WC 2026 bracket is locked 🏆`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <h2 style="color:#111;margin-bottom:8px;font-size:22px">
            Bracket locked, ${displayName}! 🎉
          </h2>
          <p style="color:#555;margin-bottom:8px">
            Your FIFA World Cup 2026 bracket prediction has been saved.
          </p>
          ${championHtml}
          <a href="${bracketUrl}"
             style="display:inline-block;background:#c8102e;color:#fff;
                    font-weight:700;padding:14px 28px;border-radius:8px;
                    text-decoration:none;font-size:15px;margin-bottom:28px">
            View my bracket →
          </a>
          <hr style="border:none;border-top:1px solid #eee;margin-bottom:20px">
          <p style="color:#888;font-size:12px;line-height:1.6">
            Your bracket code: <strong style="color:#333">${shortCode}</strong><br>
            Scores update automatically after every match.<br>
            Check the <a href="${leaderboardUrl}" style="color:#c8102e">leaderboard</a>
            to see how you rank against other players.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[send-confirmation]', error);
      return NextResponse.json({ sent: false, error: error.message });
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error('[send-confirmation]', err);
    return NextResponse.json({ sent: false, error: String(err) });
  }
}
