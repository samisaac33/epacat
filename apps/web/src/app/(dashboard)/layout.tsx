import { DashboardNav } from '@/components/DashboardNav';
import { Providers } from '../providers';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <DashboardNav />
      <main className="p-6 max-w-7xl mx-auto">{children}</main>
    </Providers>
  );
}
