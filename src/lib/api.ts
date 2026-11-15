import type { components } from './api-schema';
export type Location = components['schemas']['Location'];
export type ExploreRequest = components['schemas']['ExploreRequest'];
export type ExploreResponse = components['schemas']['ExploreResponse'];
export type RotationRequest = components['schemas']['RotationRequest'];
export type RotationResponse = components['schemas']['RotationResponse'];
export type CropCatalog = components['schemas']['CropCatalog'];
export type Metadata = components['schemas']['Metadata'];
export type Panel = components['schemas']['Panel'];
export type MapLayer = components['schemas']['MapLayer'];
export type Category = ExploreRequest['categories'][number];

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 0,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Cache only successful, read-only responses. No browser storage or cached PDF blobs.
const cache = new Map<string, { until: number; value: unknown }>();
const TTL = 30 * 1000;
const MAX_ITEMS = 20;
export function clearApiCache() {
  cache.clear();
}
export async function api<T>(path: string, body?: unknown): Promise<T> {
  const key = path + JSON.stringify(body ?? null);
  const hit = cache.get(key);
  if (hit && hit.until > Date.now()) return structuredClone(hit.value) as T;
  const response = await fetch(`/api/backend/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(25000),
  }).catch(() => {
    throw new ApiError('We could not reach the data service. Please try again.');
  });
  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new ApiError(
      result?.error?.message ?? 'The request could not be completed. Please try again.',
      response.status,
    );
  }
  const value = await response.json();
  const serverTtl = Number(response.headers?.get('X-Agro-Cache-Ttl-Ms') ?? TTL);
  const remaining = Number.isFinite(serverTtl) ? Math.max(0, Math.min(TTL, serverTtl)) : TTL;
  if (cache.size >= MAX_ITEMS) cache.delete(cache.keys().next().value!);
  cache.set(key, { until: Date.now() + remaining, value: structuredClone(value) });
  return value as T;
}
export async function downloadReport(exploration: ExploreRequest, rotation?: RotationRequest) {
  const response = await fetch('/api/backend/exports/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exploration, ...(rotation ? { rotation } : {}) }),
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new ApiError(
      error?.error?.message ?? 'We could not make the report. Please try again.',
      response.status,
    );
  }
  if (!response.headers.get('content-type')?.includes('application/pdf'))
    throw new ApiError('The report response was not a PDF.');
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = `agro-field-${exploration.location_id}-${exploration.start_date}.pdf`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
