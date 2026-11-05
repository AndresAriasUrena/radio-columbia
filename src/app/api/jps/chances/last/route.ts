import { NextResponse } from 'next/server';
import { DRAW_REVALIDATE, getLastDraw } from '@/lib/jpsDraws';

export const runtime = 'edge';
export const revalidate = DRAW_REVALIDATE;

export async function GET() {
  const draw = await getLastDraw('chances');
  return NextResponse.json(draw, { status: 200 });
}
