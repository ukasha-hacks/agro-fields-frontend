import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const fetchMock = vi.fn();
beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
it.each([
  { mode: 'production', configured: undefined, expected: 'https://agrofield-api.vercel.app' },
  { mode: 'production', configured: ' ', expected: 'https://agrofield-api.vercel.app' },
  { mode: 'development', configured: undefined, expected: 'http://127.0.0.1:8000' },
  {
    mode: 'production',
    configured: ' https://custom-api.example/// ',
    expected: 'https://custom-api.example',
  },
] as const)(
  'routes $mode requests with backend setting $configured',
  async ({ mode, configured, expected }) => {
    vi.stubEnv('NODE_ENV', mode);
    vi.stubEnv('BACKEND_URL', configured);
    fetchMock.mockResolvedValue(Response.json({ items: [] }));
    const { GET } = await import('../src/app/api/backend/[...path]/route');
    const response = await GET(new NextRequest('http://localhost/api/backend/crops'), {
      params: Promise.resolve({ path: ['crops'] }),
    });
    expect(response.status).toBe(200);
    expect(fetchMock.mock.calls[0][0]).toBe(`${expected}/api/v1/crops`);
  },
);
it('refreshes the server catalog at 30 seconds and never serves an expired entry', async () => {
  let clock = 1000;
  vi.spyOn(Date, 'now').mockImplementation(() => clock);
  fetchMock.mockImplementation(async () => Response.json({ version: fetchMock.mock.calls.length }));
  const { GET } = await import('../src/app/api/backend/[...path]/route');
  const read = () =>
    GET(new NextRequest('http://localhost/api/backend/crops'), {
      params: Promise.resolve({ path: ['crops'] }),
    });
  expect(await (await read()).json()).toEqual({ version: 1 });
  clock += 29999;
  expect(await (await read()).json()).toEqual({ version: 1 });
  clock += 1;
  expect(await (await read()).json()).toEqual({ version: 2 });
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
it('does not cache a failed catalog response', async () => {
  fetchMock.mockResolvedValueOnce(Response.json({ error: 'Unavailable' }, { status: 503 }));
  fetchMock.mockResolvedValueOnce(Response.json({ items: ['coffee_arabica'] }));
  const { GET } = await import('../src/app/api/backend/[...path]/route');
  const read = () =>
    GET(new NextRequest('http://localhost/api/backend/crops'), {
      params: Promise.resolve({ path: ['crops'] }),
    });
  expect((await read()).status).toBe(503);
  expect(await (await read()).json()).toEqual({ items: ['coffee_arabica'] });
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
