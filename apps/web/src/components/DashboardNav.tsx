'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken } from '@/lib/api';

const links = [
  { href: '/validation', label: 'Validación' },
  { href: '/map', label: 'Mapa GIS' },
  { href: '/catastro', label: 'Catastro' },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="bg-sky-900 text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg">EPACAT</span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-sm ${pathname === l.href ? 'underline font-semibold' : 'opacity-80 hover:opacity-100'}`}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <button
        onClick={() => {
          clearToken();
          router.push('/login');
        }}
        className="text-sm bg-sky-700 px-3 py-1 rounded hover:bg-sky-600"
      >
        Salir
      </button>
    </nav>
  );
}
