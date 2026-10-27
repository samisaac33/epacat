import {
  Activity,
  Building2,
  Camera,
  ClipboardCheck,
  CloudUpload,
  Database,
  FileOutput,
  Gauge,
  Lock,
  MapPin,
  RefreshCw,
  ScanLine,
  Shield,
  Users,
  WifiOff,
  type LucideIcon,
} from 'lucide-react';
import type { LandingIcon } from '@/content/dossier';

const iconMap: Record<LandingIcon, LucideIcon> = {
  'wifi-off': WifiOff,
  scan: ScanLine,
  'refresh-cw': RefreshCw,
  'map-pin': MapPin,
  'clipboard-check': ClipboardCheck,
  users: Users,
  database: Database,
  lock: Lock,
  activity: Activity,
  camera: Camera,
  'cloud-upload': CloudUpload,
  shield: Shield,
  'file-output': FileOutput,
  gauge: Gauge,
  building: Building2,
};

export function LandingIconComponent({
  name,
  className = 'h-6 w-6 text-cyan-400',
}: {
  name: LandingIcon;
  className?: string;
}) {
  const Icon = iconMap[name] ?? Shield;
  return <Icon className={className} aria-hidden />;
}
