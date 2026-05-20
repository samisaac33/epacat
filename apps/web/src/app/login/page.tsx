'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, setToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('gerente@epacat.gob.ec');
  const [password, setPassword] = useState('epacat123');
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
      setToken(data.accessToken);
      router.push('/validation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-900 to-sky-600 px-4">
      <Link
        href="/"
        className="absolute top-6 left-6 text-sky-100/90 text-sm hover:text-white transition-colors"
      >
        ← Volver a la propuesta EPACAT
      </Link>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md space-y-4"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-sky-900">EPACAT</h1>
          <p className="text-slate-500 text-sm">Dashboard de validación gerencial</p>
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
    </div>
  );
}
