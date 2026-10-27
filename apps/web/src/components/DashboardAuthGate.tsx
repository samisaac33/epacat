'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthToken } from '@/hooks/useAuthToken';

/** Rutas del dashboard visibles sin login (demo / solo web en Vercel). */
export const PUBLIC_DASHBOARD_PATHS = new Set(['/comercial']);

export function DashboardAuthGate({ children }: { children: React.ReactNode }) {
  const token = useAuthToken();
  const pathname = usePathname();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const isPublic = PUBLIC_DASHBOARD_PATHS.has(pathname);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || isPublic) return;
    if (!token) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [hydrated, isPublic, token, pathname, router]);

  if (isPublic) {
    return <>{children}</>;
  }

  if (!hydrated) {
    return <p className="text-sm text-slate-600">Cargando sesión…</p>;
  }

  if (!token) {
    return (
      <p className="text-sm text-slate-600">
        Redirigiendo al inicio de sesión…
      </p>
    );
  }

  return <>{children}</>;
}
