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
  vi.restoreAllMocks();
});
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
