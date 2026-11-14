'use client';
import { useEffect, useState } from 'react';
import { api } from './api';
export function useApi<T>(path: string, body?: unknown, enabled = true) {
  const key = JSON.stringify([path, body]);
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState<{ key: string; data?: T; error?: string }>({ key: '' });
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    api<T>(path, body)
      .then((data) => {
        if (active) setState({ key, data });
      })
      .catch((error: Error) => {
        if (active) setState({ key, error: error.message });
      });
    return () => {
      active = false;
    };
    // The stable serialized key covers body changes without refetching on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, retry]);
  return {
    data: enabled && state.key === key ? state.data : undefined,
    error: enabled && state.key === key ? state.error : undefined,
    loading: enabled && (state.key !== key || (!state.data && !state.error)),
    refetch: () => {
      setState({ key: '' });
      setRetry((v) => v + 1);
    },
  };
}
