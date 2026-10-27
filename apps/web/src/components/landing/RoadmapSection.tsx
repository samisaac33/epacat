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

export function RoadmapSection() {
  const { roadmap } = dossier.portal;

  return (
    <SectionShell id={roadmap.id} title={roadmap.title} subtitle={roadmap.subtitle}>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        {roadmap.items.map((item) => (
          <Card key={item.title} className="border-slate-800/80 border-dashed">
            <CardHeader>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
                  <LandingIconComponent name={item.icon} className="h-6 w-6 text-slate-400" />
                </div>
                <BadgePill label={badgeLabels[item.badge]} />
              </div>
              <CardTitle className="text-lg text-slate-200">{item.title}</CardTitle>
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
