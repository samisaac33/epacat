import { loadComercialSnapshotForWeb } from '@/lib/load-comercial-snapshot';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snapshot = loadComercialSnapshotForWeb();
    return Response.json(snapshot);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al cargar snapshot comercial';
    return Response.json({ message }, { status: 500 });
  }
}
