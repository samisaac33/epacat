import { dossier } from '@/content/dossier';
import { LandingIconComponent } from './landing-icons';
import { SectionShell } from './SectionShell';

export function WorkflowSection() {
  const { workflow } = dossier.portal;

  return (
    <SectionShell
      id={workflow.id}
      title={workflow.title}
      subtitle={workflow.subtitle}
      bordered
    >
      <ol className="space-y-0" aria-label="Flujo operativo EPIM">
        {workflow.steps.map((step, index) => (
          <li key={step.step} className="relative flex gap-6 md:gap-8 pb-12 last:pb-0">
            {index < workflow.steps.length - 1 && (
              <span
                className="absolute left-[1.35rem] top-14 bottom-0 w-px bg-cyan-500/25 hidden md:block"
                aria-hidden
              />
            )}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 font-bold text-sm z-10">
              {step.step}
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-start gap-3 mb-2">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 hidden sm:block">
                  <LandingIconComponent name={step.icon} className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-2xl">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
