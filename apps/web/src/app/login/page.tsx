'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuthToken } from '@/hooks/useAuthToken';
import { apiFetch } from '@/lib/api';

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/validation';
  return raw;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get('next'));
  const [email, setEmail] = useState('gerente@epim.gob.ec');
  const [password, setPassword] = useState('epim123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch<{ accessToken: string; user: { role: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (!['MANAGER', 'ADMIN'].includes(data.user.role)) {
        setError('Solo gerentes y administradores pueden acceder al dashboard');
        return;
      }
      setAuthToken(data.accessToken);
      router.push(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md space-y-4"
    >
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-sky-900">EPIM</h1>
        <p className="text-slate-500 text-sm">Portal de administración EPIM</p>
      </div>
      {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Correo</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sky-700 text-white py-2 rounded-lg hover:bg-sky-800 disabled:opacity-50"
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-900 to-sky-600 px-4">
      <Link
        href="/"
        className="absolute top-6 left-6 text-sky-100/90 text-sm hover:text-white transition-colors"
      >
        ← Volver al portal EPIM
      </Link>
      <Suspense fallback={<p className="text-white text-sm">Cargando…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
