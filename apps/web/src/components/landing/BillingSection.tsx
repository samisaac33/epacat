import { badgeLabels, dossier } from '@/content/dossier';
import { LandingIconComponent } from './landing-icons';
import { BadgePill, SectionShell } from './SectionShell';

export function BillingSection() {
  const { billing } = dossier.portal;

  return (
    <SectionShell
      id={billing.id}
      title={billing.title}
      subtitle={billing.subtitle}
      bordered
    >
      <div className="grid md:grid-cols-3 gap-6">
        {billing.points.map((point) => (
          <div
            key={point.title}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
          >
            <div className="mb-4 inline-flex p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <LandingIconComponent name="gauge" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{point.title}</h3>
            <p className="text-slate-400 leading-relaxed">{point.description}</p>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <BadgePill label={badgeLabels[billing.badge]} />
      </div>
    </SectionShell>
  );
}
