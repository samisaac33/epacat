import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-6">
      <p className="text-cyan-400 text-sm font-medium uppercase tracking-widest mb-4">404</p>
      <h1 className="text-3xl font-bold text-white mb-2">Página no encontrada</h1>
      <p className="text-slate-400 mb-8 text-center max-w-md">
        El recurso solicitado no existe en el portal EPACAT.
      </p>
      <Button asChild>
        <Link href="/">Volver al portal</Link>
      </Button>
    </div>
  );
}
