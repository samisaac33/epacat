'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

interface Abonado {
  id: string;
  cedula: string;
  nombre: string;
  direccion: string;
  sector: string;
  medidores: Array<{ id: string; numeroSerie: string; marca: string }>;
}

export default function CatastroPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['abonados'],
    queryFn: () => apiFetch<Abonado[]>('/catastro/abonados'),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Catastro de abonados</h1>
      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <div className="grid gap-4">
          {data?.map((a) => (
            <div key={a.id} className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold">{a.nombre}</h2>
              <p className="text-sm text-slate-600">
                {a.cedula} — {a.sector}
              </p>
              <p className="text-sm">{a.direccion}</p>
              <ul className="mt-2 text-sm">
                {a.medidores.map((m) => (
                  <li key={m.id}>
                    Medidor: {m.numeroSerie} ({m.marca})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
