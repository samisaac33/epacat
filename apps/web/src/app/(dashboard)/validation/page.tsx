'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { ValidationQueueItem } from '@epacat/shared';
import { apiFetch } from '@/lib/api';

interface QueueResponse {
  items: ValidationQueueItem[];
  total: number;
}

export default function ValidationPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<ValidationQueueItem | null>(null);
  const [comentario, setComentario] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['validation-queue'],
    queryFn: () => apiFetch<QueueResponse>('/validation/queue?status=PENDING'),
  });

  const decide = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) =>
      apiFetch(`/validation/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, comentario: comentario || undefined }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validation-queue'] });
      setSelected(null);
      setComentario('');
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Cola de validación</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <p className="p-4">Cargando...</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-3">Abonado</th>
                  <th className="text-left p-3">Sector</th>
                  <th className="text-left p-3">Técnico</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className={`border-t cursor-pointer hover:bg-sky-50 ${selected?.id === item.id ? 'bg-sky-100' : ''}`}
                  >
                    <td className="p-3">{item.visita.abonado?.nombre ?? '—'}</td>
                    <td className="p-3">{item.visita.abonado?.sector ?? '—'}</td>
                    <td className="p-3">{item.visita.tecnico.nombre}</td>
                  </tr>
                ))}
                {!data?.items.length && (
                  <tr>
                    <td colSpan={3} className="p-4 text-slate-500 text-center">
                      No hay visitas pendientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          <p className="p-2 text-xs text-slate-500">Total: {data?.total ?? 0}</p>
        </div>

        {selected && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="font-semibold text-lg">Detalle de visita</h2>
            <p>
              <strong>GPS:</strong> {selected.visita.lat.toFixed(5)}, {selected.visita.lng.toFixed(5)}
            </p>
            <p>
              <strong>Medidor:</strong> {selected.visita.medidor?.numeroSerie ?? '—'}
            </p>
            {selected.visita.lecturas.map((l, i) => (
              <p key={i}>
                <strong>Lectura:</strong> {l.valor} — {new Date(l.fecha).toLocaleString('es-EC')}
              </p>
            ))}
            {selected.visita.observaciones && (
              <p>
                <strong>Obs:</strong> {selected.visita.observaciones}
              </p>
            )}
            <div className="flex gap-2 flex-wrap">
              {selected.visita.fotos.map((f) => (
                <a key={f.id} href={f.url} target="_blank" rel="noreferrer">
                  <img src={f.url} alt={f.tipo} className="w-24 h-24 object-cover rounded border" />
                </a>
              ))}
            </div>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Comentario (opcional)"
              className="w-full border rounded p-2 text-sm"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={() => decide.mutate({ id: selected.id, status: 'APPROVED' })}
                disabled={decide.isPending}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Aprobar
              </button>
              <button
                onClick={() => decide.mutate({ id: selected.id, status: 'REJECTED' })}
                disabled={decide.isPending}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Rechazar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
