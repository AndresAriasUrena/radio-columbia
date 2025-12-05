import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutos

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'data', 'lottery-results.json');
    const fileContents = readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error reading lottery results:', error);
    return NextResponse.json(
      { error: 'No se pudieron cargar los resultados' },
      { status: 500 }
    );
  }
}
