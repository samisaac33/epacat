'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';

interface PeriodoActual {
  id: string;
  anio: number;
  mes: number;
  status: string;
  fechaInicio: string;
  fechaFin: string;
  lecturasPendientes: number;
}

interface Resumen {
  totalFacturas: number;
  totalEmitido: number;
  totalCobrado: number;
  totalPendiente: number;
}

interface FacturaItem {
  id: string;
  numero: string;
  status: string;
  total: number;
  totalPagado: number;
  fechaEmision: string;
  abonado: { nombre: string; cedula: string; sector: string };
}

interface FacturasResponse {
  items: FacturaItem[];
  total: number;
}

const statusLabels: Record<string, string> = {
  EMITIDA: 'Emitida',
  PAGADA: 'Pagada',
  VENCIDA: 'Vencida',
  ANULADA: 'Anulada',
};

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function FacturacionPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: periodo, isLoading: loadingPeriodo } = useQuery({
    queryKey: ['billing-periodo-actual'],
    queryFn: () => apiFetch<PeriodoActual>('/billing/periodos/actual'),
  });

  const { data: resumen } = useQuery({
    queryKey: ['billing-resumen'],
    queryFn: () => apiFetch<Resumen>('/billing/resumen'),
  });

  const { data: facturas, isLoading: loadingFacturas } = useQuery({
    queryKey: ['billing-facturas', statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      return apiFetch<FacturasResponse>(`/billing/facturas?${params.toString()}`);
    },
  });

  const cerrarPeriodo = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/billing/periodos/${id}/cerrar`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-periodo-actual'] });
      queryClient.invalidateQueries({ queryKey: ['billing-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['billing-facturas'] });
    },
  });

  function handleCerrarPeriodo() {
    if (!periodo) return;
    const label = `${meses[periodo.mes - 1]} ${periodo.anio}`;
    if (
      window.confirm(
        `¿Cerrar el periodo ${label}? Se emitirán facturas por las lecturas validadas.`,
      )
    ) {
      cerrarPeriodo.mutate(periodo.id);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold">Facturación y cobro</h1>
        <Link
          href="/facturacion/simulador"
          className="text-sm bg-slate-100 border px-3 py-2 rounded hover:bg-slate-200"
        >
          Simulador Banco Pacífico
        </Link>
      </div>

      {loadingPeriodo ? (
        <p>Cargando periodo...</p>
      ) : periodo ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-lg">
                Periodo abierto: {meses[periodo.mes - 1]} {periodo.anio}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {new Date(periodo.fechaInicio).toLocaleDateString('es-EC')} —{' '}
                {new Date(periodo.fechaFin).toLocaleDateString('es-EC')}
              </p>
              <p className="text-sm mt-2">
                Medidores con lecturas validadas pendientes de facturar:{' '}
                <strong>{periodo.lecturasPendientes}</strong>
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Al cerrar el periodo se emiten facturas y se notifica por correo a abonados con email
                registrado. Cobro principal vía Banco Pacífico (ventanilla, banca web o móvil).
              </p>
            </div>
            <button
              onClick={handleCerrarPeriodo}
              disabled={cerrarPeriodo.isPending}
              className="bg-sky-700 text-white px-4 py-2 rounded hover:bg-sky-600 disabled:opacity-50"
            >
              {cerrarPeriodo.isPending ? 'Cerrando...' : 'Cerrar periodo'}
            </button>
          </div>
          {cerrarPeriodo.isError && (
            <p className="text-red-600 text-sm mt-2">
              {cerrarPeriodo.error instanceof Error
                ? cerrarPeriodo.error.message
                : 'Error al cerrar periodo'}
            </p>
          )}
        </div>
      ) : null}

      {resumen && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-slate-500">Facturas</p>
            <p className="text-xl font-bold">{resumen.totalFacturas}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-slate-500">Total emitido</p>
            <p className="text-xl font-bold">${resumen.totalEmitido.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-slate-500">Total cobrado</p>
            <p className="text-xl font-bold text-green-700">${resumen.totalCobrado.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-slate-500">Pendiente</p>
            <p className="text-xl font-bold text-amber-700">${resumen.totalPendiente.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between gap-4">
          <h2 className="font-semibold">Facturas</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="EMITIDA">Emitida</option>
            <option value="PAGADA">Pagada</option>
            <option value="VENCIDA">Vencida</option>
          </select>
        </div>
        {loadingFacturas ? (
          <p className="p-4">Cargando facturas...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left p-3">Número</th>
                <th className="text-left p-3">Abonado</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-right p-3">Total</th>
                <th className="text-right p-3">Pagado</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {facturas?.items.map((f) => (
                <tr key={f.id} className="border-t hover:bg-sky-50">
                  <td className="p-3 font-mono text-xs">{f.numero}</td>
                  <td className="p-3">
                    <div>{f.abonado.nombre}</div>
                    <div className="text-xs text-slate-500">{f.abonado.cedula}</div>
                  </td>
                  <td className="p-3">{statusLabels[f.status] ?? f.status}</td>
                  <td className="p-3 text-right">${f.total.toFixed(2)}</td>
                  <td className="p-3 text-right">${f.totalPagado.toFixed(2)}</td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/facturacion/${f.id}`}
                      className="text-sky-700 hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
              {!facturas?.items.length && (
                <tr>
                  <td colSpan={6} className="p-4 text-slate-500 text-center">
                    No hay facturas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
