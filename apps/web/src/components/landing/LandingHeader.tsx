import Link from 'next/link';
import { dossier } from '@/content/dossier';
import { Button } from '@/components/ui/button';

export function LandingHeader() {
  const { nav } = dossier.portal;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-semibold text-slate-100 tracking-tight">
          <span className="text-cyan-400">EPA</span>CAT
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
        <Button variant="default" size="sm" asChild>
          <Link href="/login">Acceso</Link>
        </Button>
      </div>
    </header>
  );
}
