import { NextRequest } from 'next/server';

const readCache = new Map<string, { until: number; body: ArrayBuffer; contentType: string }>();
const CACHE_MS = 30_000;

const reads = new Set(['metadata', 'locations', 'locations.geojson', 'crops', 'map-layers']);
const writes = new Set(['explore', 'rotation-comparisons', 'exports/pdf']);
export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context);
}
export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context);
}
async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const key = path.join('/');
  const preview = /^map-layers\/[a-zA-Z0-9_-]+\/preview$/.test(key);
  const allowed = request.method === 'GET' ? reads.has(key) || preview : writes.has(key);
  if (!allowed)
    return Response.json(
      { error: { message: 'This data request is not supported.' } },
      { status: 404 },
    );
  const base = (process.env.BACKEND_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
  const cacheKey = `${base}/${key}`;
  const cached = request.method === 'GET' ? readCache.get(cacheKey) : undefined;
  if (cached && cached.until > Date.now()) {
    return new Response(cached.body.slice(0), {
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'no-store',
        'X-Agro-Cache-Ttl-Ms': String(cached.until - Date.now()),
      },
    });
  }
  readCache.delete(cacheKey);
  try {
    const response = await fetch(`${base}/api/v1/${key}`, {
      method: request.method,
      headers: { ...(request.method === 'POST' ? { 'Content-Type': 'application/json' } : {}) },
      body: request.method === 'POST' ? await request.text() : undefined,
      signal: AbortSignal.timeout(key === 'exports/pdf' ? 55000 : 20000),
      cache: 'no-store',
    });
    const body = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') ?? 'application/json';
    // Expired entries are fetched again; there is no disk cache surviving an API update.
    if (request.method === 'GET' && response.ok) {
      if (readCache.size >= 20) readCache.delete(readCache.keys().next().value!);
      readCache.set(cacheKey, { until: Date.now() + CACHE_MS, body: body.slice(0), contentType });
    }
    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
        'X-Agro-Cache-Ttl-Ms': String(CACHE_MS),
      },
    });
  } catch {
    return Response.json(
      { error: { message: 'The data service is not available. Please try again shortly.' } },
      { status: 503 },
    );
  }
}
