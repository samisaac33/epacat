'use client';

import { useSyncExternalStore } from 'react';
import { getToken, setToken as persistToken, clearToken as clearPersistedToken } from '@/lib/api';

const AUTH_EVENT = 'epim-auth-change';

function subscribe(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(AUTH_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(AUTH_EVENT, onStoreChange);
  };
}

function getSnapshot() {
  return getToken();
}

function getServerSnapshot() {
  return null;
}

export function useAuthToken(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setAuthToken(token: string) {
  persistToken(token);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAuthToken() {
  clearPersistedToken();
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function useHasAuthToken(): boolean {
  const token = useAuthToken();
  return Boolean(token);
}
