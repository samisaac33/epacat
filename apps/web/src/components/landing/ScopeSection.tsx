import { dossier } from '@/content/dossier';
import { SectionShell } from './SectionShell';

export function ScopeSection() {
  const { scope } = dossier.portal;

  return (
    <SectionShell id={scope.id} title={scope.title} subtitle={scope.subtitle}>
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {scope.challenges.map((c) => (
          <div
            key={c.title}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-2">{c.title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm">{c.description}</p>
          </div>
        ))}
      </div>
      <p className="text-cyan-400/90 text-base md:text-lg font-medium leading-relaxed max-w-4xl border border-cyan-500/20 rounded-xl bg-cyan-500/5 px-6 py-5">
        {scope.outcome}
      </p>
    </SectionShell>
  );
}
