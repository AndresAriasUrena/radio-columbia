import { NextResponse } from 'next/server';

export const revalidate = 900;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch(
      'https://www.thesportsdb.com/api/v1/json/123/lookuptable.php?l=4815',
      { next: { revalidate: 900 } }
    );

    if (!res.ok) return NextResponse.json({ rows: [] });

    const data = await res.json();
    const table = data?.table;
    if (!Array.isArray(table) || table.length === 0) return NextResponse.json({ rows: [] });

    const rows = table.map((t: any) => ({
      pos: parseInt(t.intRank) || 0,
      team: t.strTeam || '',
      played: parseInt(t.intPlayed) || 0,
      wins: parseInt(t.intWin) || 0,
      draws: parseInt(t.intDraw) || 0,
      losses: parseInt(t.intLoss) || 0,
      points: parseInt(t.intPoints) || 0,
    }));

    return NextResponse.json({ rows });
  } catch {
    return NextResponse.json({ rows: [] });
  }
}
