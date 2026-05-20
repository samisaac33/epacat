'use client';

import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import type { GeoJsonFeatureCollection } from '@epacat/shared';
import { apiFetch } from '@/lib/api';

const VisitaMap = dynamic(() => import('@/components/VisitaMap').then((m) => m.VisitaMap), {
  ssr: false,
  loading: () => <p className="p-4">Cargando mapa...</p>,
});

export default function MapPage() {
  const bbox = '-80.75,-0.98,-80.68,-0.92';
  const { data, isLoading, error } = useQuery({
    queryKey: ['gis-visitas', bbox],
    queryFn: () =>
      apiFetch<GeoJsonFeatureCollection>(`/gis/visitas?bbox=${bbox}`),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mapa GIS — Manabí</h1>
      {isLoading && <p>Cargando visitas...</p>}
      {error && <p className="text-red-600">Error al cargar el mapa</p>}
      {data && <VisitaMap data={data} />}
      {data && (
        <p className="text-sm text-slate-500 mt-2">{data.features.length} visitas en el mapa</p>
      )}
    </div>
  );
}
