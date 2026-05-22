import { useState, useEffect, useRef, useCallback } from 'react';

interface SyncOptions<T> {
  localKey: string;
  defaultValue: T;
  rpcQuery?: () => Promise<T>;
  rpcMutate?: (value: T) => Promise<void>;
}

interface SyncState {
  backendAvailable: boolean;
  syncing: boolean;
  lastError: string | null;
  lastSyncAt: string | null;
}

/**
 * Unified sync hook: localStorage + backend RPC
 * - Loads from localStorage instantly (no blocking)
 * - Always tries to sync with backend (with retry)
 * - Pulls remote data on mount and window focus
 * - Falls back to localStorage if backend is unreachable
 */
export function useSyncedState<T>(options: SyncOptions<T>) {
  const { localKey, defaultValue, rpcQuery, rpcMutate } = options;

  // Data state - initialized from localStorage
  const [data, setData] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return defaultValue;
  });

  // Sync status
  const [syncState, setSyncState] = useState<SyncState>({
    backendAvailable: false,
    syncing: false,
    lastError: null,
    lastSyncAt: null,
  });

  const lastSaveRef = useRef<string>('');
  const dataRef = useRef<T>(data);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Keep dataRef in sync
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // ===== Ping backend to check availability =====
  const pingBackend = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch('/api/trpc/ping', {
        signal: controller.signal,
        credentials: 'include',
      });
      clearTimeout(timeout);
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  // ===== Pull data from backend =====
  const pullFromBackend = useCallback(async () => {
    if (!optionsRef.current.rpcQuery) return;
    const isAvailable = await pingBackend();
    setSyncState(prev => ({ ...prev, backendAvailable: isAvailable }));
    if (!isAvailable) {
      console.log(`[useSyncedState:${localKey}] Backend unavailable, skip pull`);
      return;
    }
    try {
      console.log(`[useSyncedState:${localKey}] Pulling from backend...`);
      const remoteData = await optionsRef.current.rpcQuery();
      const currentData = dataRef.current;
      if (remoteData !== undefined && JSON.stringify(remoteData) !== JSON.stringify(currentData)) {
        console.log(`[useSyncedState:${localKey}] Remote data differs, updating local`);
        setData(remoteData);
        lastSaveRef.current = JSON.stringify(remoteData);
        try {
          localStorage.setItem(localKey, JSON.stringify(remoteData));
        } catch { /* ignore */ }
      } else {
        console.log(`[useSyncedState:${localKey}] Remote data same as local`);
      }
      setSyncState(prev => ({
        ...prev,
        lastError: null,
        lastSyncAt: new Date().toLocaleTimeString('zh-CN'),
      }));
    } catch (err: any) {
      console.error(`[useSyncedState:${localKey}] Pull failed:`, err.message || err);
      setSyncState(prev => ({ ...prev, lastError: '拉取失败: ' + (err.message || '未知错误') }));
    }
  }, [localKey, pingBackend]);

  // ===== Push data to backend =====
  const pushToBackend = useCallback(async (newData: T) => {
    if (!optionsRef.current.rpcMutate) return;
    const isAvailable = await pingBackend();
    setSyncState(prev => ({ ...prev, backendAvailable: isAvailable }));
    if (!isAvailable) {
      console.log(`[useSyncedState:${localKey}] Backend unavailable, data saved to localStorage only`);
      return;
    }
    setSyncState(prev => ({ ...prev, syncing: true }));
    try {
      console.log(`[useSyncedState:${localKey}] Pushing to backend...`);
      await optionsRef.current.rpcMutate(newData);
      console.log(`[useSyncedState:${localKey}] Push succeeded`);
      setSyncState(prev => ({
        ...prev,
        syncing: false,
        lastError: null,
        lastSyncAt: new Date().toLocaleTimeString('zh-CN'),
      }));
    } catch (err: any) {
      console.error(`[useSyncedState:${localKey}] Push failed:`, err.message || err);
      setSyncState(prev => ({
        ...prev,
        syncing: false,
        lastError: '同步失败: ' + (err.message || '未知错误'),
      }));
    }
  }, [localKey, pingBackend]);

  // ===== Pull on mount =====
  useEffect(() => {
    pullFromBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Pull on window focus (switch back from other tab/device) =====
  useEffect(() => {
    const handleFocus = () => {
      console.log(`[useSyncedState:${localKey}] Window focused, pulling...`);
      pullFromBackend();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [localKey, pullFromBackend]);

  // ===== Persist: localStorage + backend =====
  const persist = useCallback(async (newData: T) => {
    const serialized = JSON.stringify(newData);
    if (serialized === lastSaveRef.current) return;
    lastSaveRef.current = serialized;

    // Update React state
    setData(newData);
    dataRef.current = newData;

    // Save to localStorage immediately
    try {
      localStorage.setItem(localKey, serialized);
    } catch { /* ignore */ }

    // Push to backend
    await pushToBackend(newData);
  }, [localKey, pushToBackend]);

  // Force pull function (for manual refresh)
  const forcePull = useCallback(() => {
    pullFromBackend();
  }, [pullFromBackend]);

  return {
    data,
    setData: persist,
    syncing: syncState.syncing,
    backendAvailable: syncState.backendAvailable,
    lastError: syncState.lastError,
    lastSyncAt: syncState.lastSyncAt,
    forcePull,
  };
}
