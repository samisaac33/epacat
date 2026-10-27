import { dossier } from '@/content/dossier';
import { LandingIconComponent } from './landing-icons';
import { SectionShell } from './SectionShell';

export function SecuritySection() {
  const { security } = dossier.portal;

  return (
    <SectionShell
      id={security.id}
      title={security.title}
      subtitle={security.subtitle}
      bordered
    >
      <div className="grid md:grid-cols-2 gap-8">
        {security.items.map((item) => (
          <div key={item.title} className="flex gap-4">
            <div className="inline-flex h-fit p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
              <LandingIconComponent name={item.icon} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
