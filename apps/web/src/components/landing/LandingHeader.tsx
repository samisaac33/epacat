'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { dossier } from '@/content/dossier';
import { Button } from '@/components/ui/button';

export function LandingHeader() {
  const { nav } = dossier.portal;
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-semibold text-slate-100 tracking-tight"
          onClick={() => setOpen(false)}
        >
          <span className="text-cyan-400">EP</span>IM
        </Link>

        <nav
          className="hidden md:flex items-center gap-8 text-sm text-slate-400"
          aria-label="Navegación principal"
        >
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-cyan-400 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/login">Acceso</Link>
          </Button>
          <button
            type="button"
            className="md:hidden p-2 text-slate-400 hover:text-cyan-400 rounded-lg border border-slate-800"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="md:hidden border-t border-slate-800/60 bg-slate-950/95 px-6 py-4 flex flex-col gap-3"
          aria-label="Navegación móvil"
        >
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-slate-300 hover:text-cyan-400 py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <Button variant="default" size="sm" className="mt-2 w-full sm:hidden" asChild>
            <Link href="/login" onClick={() => setOpen(false)}>
              Acceso al portal
            </Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
