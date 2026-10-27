import { dossier } from '@/content/dossier';
import { SectionShell } from './SectionShell';

export function ArchitectureSection() {
  const { architecture } = dossier.portal;

  return (
    <SectionShell
      id={architecture.id}
      title={architecture.title}
      subtitle={architecture.subtitle}
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {architecture.businessLayers.map((layer, i) => (
          <div
            key={layer.label}
            className="relative rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-center"
          >
            {i < architecture.businessLayers.length - 1 && (
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

      <details className="group rounded-xl border border-slate-800 bg-slate-900/30">
        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden px-6 py-4 text-slate-300 font-medium hover:text-cyan-400 transition-colors flex items-center justify-between gap-4">
          <span>{architecture.techAccordionTitle}</span>
          <span
            className="text-cyan-500/80 text-sm group-open:rotate-180 transition-transform"
            aria-hidden
          >
            ▼
          </span>
        </summary>
        <div className="px-6 pb-6 pt-2 border-t border-slate-800/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {architecture.techLayers.map((layer) => (
              <div
                key={layer.label}
                className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-4 text-center"
              >
                <p className="font-medium text-slate-300 text-xs mb-1">{layer.label}</p>
                <p className="text-[11px] text-slate-500 leading-snug">{layer.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </details>
    </SectionShell>
  );
}
