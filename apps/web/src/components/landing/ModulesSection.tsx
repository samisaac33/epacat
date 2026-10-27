import { badgeLabels, dossier } from '@/content/dossier';
import { BadgePill, SectionShell } from './SectionShell';

export function ModulesSection() {
  const { modules } = dossier.portal;

  return (
    <SectionShell id={modules.id} title={modules.title} subtitle={modules.subtitle}>
      <div className="grid md:grid-cols-2 gap-8">
        {modules.roles.map((role) => (
          <div
            key={role.id}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-8"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{role.title}</h3>
                <p className="text-cyan-400/80 text-sm mt-1">{role.subtitle}</p>
              </div>
              <BadgePill label={badgeLabels[role.badge]} />
            </div>
            <ul className="space-y-3">
              {role.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-slate-400 text-sm leading-relaxed"
                >
                  <span className="text-cyan-500 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
