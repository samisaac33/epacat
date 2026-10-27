import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { dossier } from '@/content/dossier';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const { hero } = dossier.portal;

  return (
    <section className="relative overflow-hidden bg-dot-pattern">
      <div
        className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-slate-950/50 to-slate-950 pointer-events-none"
        aria-hidden
      />
      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-32 md:pt-32 md:pb-40">
        <p className="text-cyan-400/90 text-sm font-medium uppercase tracking-[0.2em] mb-6">
          {hero.eyebrow}
        </p>
        <p className="text-cyan-400/70 text-sm font-medium mb-3 max-w-3xl">
          <span className="text-cyan-400 font-bold text-lg tracking-tight">{hero.acronym}</span>
          {' — '}
          {hero.acronymExpansion}
        </p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          {hero.title}
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-6">
          {hero.subtitle}
        </p>
        <p className="text-sm text-slate-500 max-w-2xl mb-10 border-l-2 border-cyan-500/40 pl-4">
          {hero.pilotNote}
        </p>
        <div className="flex flex-wrap gap-4">
          <Button variant="default" size="lg" asChild>
            <Link href="/login">
              <LogIn className="h-5 w-5" aria-hidden />
              {hero.ctaPrimary}
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href={hero.ctaSecondaryHref}>{hero.ctaSecondary}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
