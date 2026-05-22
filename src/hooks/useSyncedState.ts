import { useState, useEffect, useRef, useCallback } from 'react';

interface SyncOptions<T> {
  localKey: string;
  defaultValue: T;
  rpcQuery?: () => Promise<T>;
  rpcMutate?: (value: T) => Promise<void>;
}

/**
 * Unified sync hook: localStorage + optional backend RPC
 * - Always loads from localStorage instantly (no blocking)
 * - Silently tries to sync with backend if available
 * - Falls back to localStorage if backend is unreachable
 */
export function useSyncedState<T>(options: SyncOptions<T>) {
  const { localKey, defaultValue, rpcQuery, rpcMutate } = options;
  const [data, setData] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return defaultValue;
  });
  const [syncing, setSyncing] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const lastSaveRef = useRef<string>('');

  // Detect backend availability
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/trpc/ping', { signal: controller.signal, credentials: 'include' })
      .then(r => { if (r.ok) setBackendAvailable(true); })
      .catch(() => { /* backend not available */ });
    const timeout = setTimeout(() => controller.abort(), 2000);
    return () => clearTimeout(timeout);
  }, []);

  // Try to load from backend (silent, non-blocking)
  useEffect(() => {
    if (!backendAvailable || !rpcQuery) return;
    rpcQuery()
      .then(remoteData => {
        if (remoteData && JSON.stringify(remoteData) !== JSON.stringify(data)) {
          setData(remoteData);
        }
      })
      .catch(() => { /* fallback to localStorage */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendAvailable]);

  // Persist changes: backend first, then localStorage fallback
  const persist = useCallback(async (newData: T) => {
    const serialized = JSON.stringify(newData);
    if (serialized === lastSaveRef.current) return;
    lastSaveRef.current = serialized;

    setData(newData);

    // Always save to localStorage
    try { localStorage.setItem(localKey, serialized); } catch { /* ignore */ }

    // Try to sync with backend
    if (backendAvailable && rpcMutate) {
      setSyncing(true);
      try {
        await rpcMutate(newData);
      } catch {
        // Backend failed, data is still in localStorage
      } finally {
        setSyncing(false);
      }
    }
  }, [backendAvailable, localKey, rpcMutate]);

  return { data, setData: persist, syncing, backendAvailable };
}
