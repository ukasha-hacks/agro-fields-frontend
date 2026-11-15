import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { api, clearApiCache } from '../src/lib/api';
const fetchMock = vi.fn();
beforeEach(() => {
  clearApiCache();
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it('reuses successful results and protects cached values from mutations', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ value: 0, points: [null, 0] }) });
  const first = await api<{ points: (number | null)[] }>('explore', {
    location_id: 'northern_gulu',
  });
  first.points[0] = 99;
  const second = await api<{ points: (number | null)[] }>('explore', {
    location_id: 'northern_gulu',
  });
  expect(second.points).toEqual([null, 0]);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
it('uses different keys for different selections', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
  await api('explore', { location_id: 'northern_gulu' });
  await api('explore', { location_id: 'eastern_mbale' });
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
it('expires a cached response at thirty seconds', async () => {
  let clock = 1000;
  vi.spyOn(Date, 'now').mockImplementation(() => clock);
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
  await api('locations');
  clock += 29999;
  await api('locations');
  expect(fetchMock).toHaveBeenCalledTimes(1);
  clock += 1;
  await api('locations');
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
it('does not cache an error', async () => {
  fetchMock.mockResolvedValueOnce({
    ok: false,
    status: 503,
    json: async () => ({ error: { message: 'Service unavailable' } }),
  });
  await expect(api('locations')).rejects.toThrow('Service unavailable');
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [] });
  await expect(api('locations')).resolves.toEqual([]);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
it('does not extend an almost expired server response for another thirty seconds', async () => {
  let clock = 1000;
  vi.spyOn(Date, 'now').mockImplementation(() => clock);
  fetchMock.mockResolvedValue({
    ok: true,
    headers: new Headers({ 'X-Agro-Cache-Ttl-Ms': '1000' }),
    json: async () => ({}),
  });
  await api('locations');
  clock += 1000;
  await api('locations');
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
