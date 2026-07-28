import { NextResponse } from 'next/server';

// No usar cache para obtener datos siempre frescos
export const dynamic = 'force-dynamic';

function stripTags(input: string): string {
	return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeEntities(input: string): string {
	return input
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í')
		.replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú').replace(/&ntilde;/g, 'ñ')
		.replace(/&#([0-9]+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

export async function GET() {
	try {
		const url = 'https://rsn.ucr.ac.cr/actividad-sismica/ultimos-sismos';
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 8000);

		let res: Response;
		try {
			res = await fetch(url, {
				cache: 'no-store',
				signal: controller.signal,
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
					'Accept': 'text/html,application/xhtml+xml',
					'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
				}
			});
		} finally {
			clearTimeout(timeoutId);
		}

		if (!res.ok) {
			return NextResponse.json({ items: [] }, { status: 200 });
		}
		const html = await res.text();

		const regex = /<a[^>]+href=\"([^\"]*\/actividad-sismica\/ultimos-sismos\/[^\"]*)\"[^>]*>([\s\S]*?)<\/a>/gi;
		const items: Array<{ title: string; dateText: string; magnitudeText: string; magnitude: number | null; url: string; }> = [];
		let match: RegExpExecArray | null;
		while ((match = regex.exec(html)) && items.length < 10) {
			const href = match[1];
			const content = decodeEntities(stripTags(match[2]));
			const title = content;
			const magMatch = title.match(/Mag:\s*([0-9]+[\.,][0-9]+)\s*Mw/i);
			const magnitudeText = magMatch ? magMatch[1].replace(',', '.') : '';
			const magnitude = magnitudeText ? parseFloat(magnitudeText) : null;
			const parts = title.split(',');
			const dateText = parts.slice(1, 3).join(',').trim();
			const absolute = href.startsWith('http') ? href : `https://rsn.ucr.ac.cr${href}`;
			items.push({ title, dateText, magnitudeText, magnitude, url: absolute });
		}

		const top3 = items.slice(0, 3);
		return NextResponse.json({ items: top3 });
	} catch (err: any) {
		return NextResponse.json({ items: [] }, { status: 200 });
	}
}