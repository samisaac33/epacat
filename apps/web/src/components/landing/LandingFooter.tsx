import { dossier } from '@/content/dossier';

export function LandingFooter() {
  const { footer } = dossier.portal;

  return (
    <footer className="border-t border-slate-800/60 bg-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-6 text-center space-y-3">
        <p className="text-slate-300 font-medium">{footer.copyright}</p>
        <p className="text-cyan-400/80 text-sm">{footer.tagline}</p>
        <p className="text-slate-500 text-xs max-w-md mx-auto">{footer.disclaimer}</p>
      </div>
    </footer>
  );
}
