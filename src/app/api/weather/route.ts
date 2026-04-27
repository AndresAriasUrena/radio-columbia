import { NextResponse } from 'next/server';

export const revalidate = 1800;
export const dynamic = 'force-dynamic';

const API_KEY = 'e6fb6fee32404c599a2181234250708';

const CITIES = [
  { name: 'San José', query: 'San Jose,CR' },
  { name: 'Alajuela', query: 'Alajuela,CR' },
  { name: 'Heredia', query: 'Heredia,CR' },
  { name: 'Cartago', query: 'Cartago,CR' },
  { name: 'Guanacaste', query: 'Guanacaste,CR' },
  { name: 'Puntarenas', query: 'Puntarenas,CR' },
  { name: 'Limón', query: 'Limon,CR' },
];

export async function GET() {
  try {
    const results = await Promise.all(
      CITIES.map(async (c) => {
        const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(c.query)}&aqi=no&lang=es`;
        const res = await fetch(url, { next: { revalidate: 1800 } });
        if (!res.ok) return null;
        const data = await res.json();
        if (!data?.current) return null;
        return {
          city: c.name,
          temp_c: data.current.temp_c,
          condition: data.current.condition?.text || '',
          icon: `https:${data.current.condition?.icon || ''}`,
          feelslike_c: data.current.feelslike_c,
          wind_kph: data.current.wind_kph,
          last_updated: data.current.last_updated,
        };
      })
    );

    const cities = results.filter(Boolean);
    return NextResponse.json({ cities });
  } catch {
    return NextResponse.json({ cities: [] });
  }
}
