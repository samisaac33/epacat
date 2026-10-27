import { badgeLabels, dossier } from '@/content/dossier';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LandingIconComponent } from './landing-icons';
import { BadgePill, SectionShell } from './SectionShell';

export function CapabilitiesSection() {
  const { capabilities } = dossier.portal;

  return (
    <SectionShell
      id={capabilities.id}
      title={capabilities.title}
      subtitle={capabilities.subtitle}
      bordered
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {capabilities.items.map((item) => (
          <Card
            key={item.id}
            className="border-slate-800/80 hover:border-cyan-500/30 transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <LandingIconComponent name={item.icon} />
                </div>
                <BadgePill label={badgeLabels[item.badge]} />
              </div>
              <CardTitle className="text-xl">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{item.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}
