import type { Metadata } from 'next';
import { dossier } from '@/content/dossier';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { HeroSection } from '@/components/landing/HeroSection';
import { ScopeSection } from '@/components/landing/ScopeSection';
import { WorkflowSection } from '@/components/landing/WorkflowSection';
import { ModulesSection } from '@/components/landing/ModulesSection';
import { CapabilitiesSection } from '@/components/landing/CapabilitiesSection';
import { BillingSection } from '@/components/landing/BillingSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { SecuritySection } from '@/components/landing/SecuritySection';
import { RoadmapSection } from '@/components/landing/RoadmapSection';
import { CtaSection } from '@/components/landing/CtaSection';

export const metadata: Metadata = {
  title: dossier.meta.title,
  description: dossier.meta.description,
};

export default function PortalPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <LandingHeader />
      <HeroSection />
      <ScopeSection />
      <WorkflowSection />
      <ModulesSection />
      <CapabilitiesSection />
      <BillingSection />
      <BenefitsSection />
      <SecuritySection />
      <RoadmapSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
