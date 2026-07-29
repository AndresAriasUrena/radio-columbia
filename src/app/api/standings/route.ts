import { NextResponse } from 'next/server';

export const revalidate = 900;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/v2/sports/soccer/crc.1/standings',
      { next: { revalidate: 900 } }
    );

    if (!res.ok) return NextResponse.json({ rows: [] });

    const data = await res.json();
    const entries = data?.children?.[0]?.standings?.entries;
    if (!Array.isArray(entries) || entries.length === 0) return NextResponse.json({ rows: [] });

    const rows = entries
      .map((e: any) => {
        const stats: Record<string, string> = {};
        for (const s of e.stats || []) {
          stats[s.name] = s.displayValue;
        }
        return {
          pos: parseInt(stats.rank) || 0,
          team: e.team?.displayName || '',
          played: parseInt(stats.gamesPlayed) || 0,
          wins: parseInt(stats.wins) || 0,
          draws: parseInt(stats.ties) || 0,
          losses: parseInt(stats.losses) || 0,
          points: parseInt(stats.points) || 0,
        };
      })
      .sort((a, b) => a.pos - b.pos);

    return NextResponse.json({ rows });
  } catch {
    return NextResponse.json({ rows: [] });
  }
}
