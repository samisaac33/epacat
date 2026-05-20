import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Activity,
  Database,
  Lock,
  LogIn,
  RefreshCw,
  ScanLine,
  Shield,
  WifiOff,
  type LucideIcon,
} from 'lucide-react';
import { dossier } from '@/content/dossier';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: dossier.meta.title,
  description: dossier.meta.description,
};

const pillarIcons: Record<string, LucideIcon> = {
  'wifi-off': WifiOff,
  scan: ScanLine,
  'refresh-cw': RefreshCw,
};

const securityIcons: Record<string, LucideIcon> = {
  database: Database,
  lock: Lock,
  activity: Activity,
};

export default function PortalPage() {
  const { hero, pillars, architecture, security } = dossier.portal;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <LandingHeader />

      <section className="relative overflow-hidden bg-dot-pattern">
        <div
          className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-slate-950/50 to-slate-950 pointer-events-none"
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-32 md:pt-32 md:pb-40">
          <p className="text-cyan-400/90 text-sm font-medium uppercase tracking-[0.2em] mb-6">
            {hero.eyebrow}
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
            {hero.title}
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-10">
            {hero.subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="default" size="lg" asChild>
              <Link href="/login">
                <LogIn className="h-5 w-5" aria-hidden />
                {hero.ctaPrimary}
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#arquitectura">{hero.ctaSecondary}</a>
            </Button>
          </div>
        </div>
      </section>

      <section id="pilares" className="py-24 md:py-32 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{pillars.title}</h2>
            <p className="text-slate-400 text-lg leading-relaxed">{pillars.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.items.map((item) => {
              const Icon = pillarIcons[item.icon] ?? WifiOff;
              return (
                <Card
                  key={item.id}
                  className="border-slate-800/80 hover:border-cyan-500/30 transition-colors"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <Icon className="h-6 w-6 text-cyan-400" aria-hidden />
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-cyan-400/80 border border-cyan-500/20 rounded-full px-2 py-0.5 shrink-0">
                        {item.badge}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="arquitectura"
        className="py-24 md:py-32 border-y border-slate-800/60 bg-slate-900/20 scroll-mt-20"
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">{architecture.title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {architecture.layers.map((layer, i) => (
              <div
                key={layer.label}
                className="relative rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-center"
              >
                {i < architecture.layers.length - 1 && (
                  <span
                    className="hidden md:block absolute top-1/2 -right-2 w-4 h-px bg-cyan-500/40 z-10"
                    aria-hidden
                  />
                )}
                <p className="font-semibold text-cyan-400 text-sm mb-1">{layer.label}</p>
                <p className="text-xs text-slate-500 leading-snug">{layer.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="seguridad" className="py-24 md:py-32 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{security.title}</h2>
            <p className="text-slate-400 text-lg leading-relaxed">{security.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {security.items.map((item) => {
              const Icon = securityIcons[item.icon] ?? Shield;
              return (
                <div key={item.title} className="space-y-4">
                  <div className="inline-flex p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <Icon className="h-6 w-6 text-cyan-400" aria-hidden />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Button variant="default" size="lg" asChild>
            <Link href="/login">
              <Lock className="h-5 w-5" aria-hidden />
              {hero.ctaPrimary}
            </Link>
          </Button>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
