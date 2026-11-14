import { NextRequest } from 'next/server';

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
  try {
    const response = await fetch(`${base}/api/v1/${key}`, {
      method: request.method,
      headers: { ...(request.method === 'POST' ? { 'Content-Type': 'application/json' } : {}) },
      body: request.method === 'POST' ? await request.text() : undefined,
      signal: AbortSignal.timeout(key === 'exports/pdf' ? 55000 : 20000),
      ...(request.method === 'GET'
        ? { next: { revalidate: 3600 } }
        : { cache: 'no-store' as const }),
    });
    return new Response(await response.arrayBuffer(), {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') ?? 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return Response.json(
      { error: { message: 'The data service is not available. Please try again shortly.' } },
      { status: 503 },
    );
  }
}
