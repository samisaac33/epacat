import Link from 'next/link';
import { Lock } from 'lucide-react';
import { dossier } from '@/content/dossier';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  const { cta, hero } = dossier.portal;

  return (
    <section className="py-20 border-t border-slate-800/60">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{cta.title}</h2>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto">{cta.subtitle}</p>
        <Button variant="default" size="lg" asChild>
          <Link href="/login">
            <Lock className="h-5 w-5" aria-hidden />
            {hero.ctaPrimary}
          </Link>
        </Button>
      </div>
    </section>
  );
}
