import { NextRequest, NextResponse } from 'next/server';
import { RSS_CONFIG } from '@/lib/rssConfig';

// Cache en memoria para el API
const cache = new Map<string, { content: string; timestamp: number }>();
const CACHE_DURATION = RSS_CONFIG.CACHE_DURATION;

async function fetchWithProxy(url: string, proxyIndex: number = 0): Promise<string> {
  if (proxyIndex >= RSS_CONFIG.PROXY_SERVICES.length) {
    throw new Error('Todos los servicios proxy fallaron');
  }

  const proxyUrl = RSS_CONFIG.PROXY_SERVICES[proxyIndex] + encodeURIComponent(url);
  console.log(`🔍 Intentando proxy ${proxyIndex + 1}: ${RSS_CONFIG.PROXY_SERVICES[proxyIndex]}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RSS_CONFIG.REQUEST_TIMEOUT);
    
    console.log(`📡 Haciendo petición a: ${proxyUrl}`);
    
    const response = await fetch(proxyUrl, {
      signal: controller.signal,
      headers: RSS_CONFIG.REQUEST_HEADERS,
      // Ignorar errores de certificados para ciertos proxies
      ...(proxyUrl.includes('thingproxy.freeboard.io') ? { rejectUnauthorized: false } : {})
    });
    
    clearTimeout(timeoutId);
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Obtener el contenido como texto primero
    const responseText = await response.text();
    
    // Verificar si el contenido está vacío
    if (!responseText || responseText.trim() === '') {
      throw new Error('Respuesta vacía del proxy');
    }
    
    // Verificar si es XML directo o JSON
    if (responseText.trim().startsWith('<?xml') || responseText.trim().startsWith('<rss')) {
      console.log(`✅ Proxy ${proxyIndex + 1} exitoso - XML directo (${responseText.length} chars)`);
      return responseText;
    } else {
      // Intentar parsear como JSON
      try {
        const data = JSON.parse(responseText);
        console.log(`✅ Proxy ${proxyIndex + 1} exitoso - JSON`);
        const content = data.contents || data;
        if (!content || (typeof content === 'string' && content.trim() === '')) {
          throw new Error('Contenido vacío en respuesta JSON');
        }
        return content;
      } catch (jsonError) {
        console.log(`⚠️ No es JSON válido, devolviendo como texto (${responseText.length} chars)`);
        return responseText;
      }
    }
  } catch (error) {
    console.warn(`❌ Proxy ${proxyIndex + 1} falló para ${url}:`, error);
    // Intentar con el siguiente proxy
    return fetchWithProxy(url, proxyIndex + 1);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  console.log(`🚀 GET /api/rss - URL: ${url}`);
  
  if (!url) {
    console.log(`❌ Error: URL parameter is required`);
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  // Verificar cache primero
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📦 Devolviendo desde cache API: ${url}`);
    return NextResponse.json({ 
      content: cached.content,
      cached: true,
      timestamp: cached.timestamp
    });
  }

  try {
    console.log(`🔄 Iniciando fetch para: ${url}`);
    const rssContent = await fetchWithProxy(url);
    
    if (!rssContent || rssContent.trim() === '') {
      throw new Error('No se pudo obtener contenido del RSS feed');
    }
    
    // Guardar en cache
    cache.set(url, { content: rssContent, timestamp: Date.now() });
    
    // Limpiar cache viejo cada 100 peticiones
    if (cache.size > 100) {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          cache.delete(key);
        }
      }
    }
    
    console.log(`✅ RSS content obtenido exitosamente (${rssContent.length} caracteres)`);
    return NextResponse.json({ 
      content: rssContent,
      cached: false,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('❌ Error fetching RSS:', error);
    return NextResponse.json(
      { error: `Failed to fetch RSS feed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
} 