'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';

interface FacturaDetalle {
  id: string;
  numero: string;
  status: string;
  subtotal: number;
  cargoFijo: number;
  total: number;
  totalPagado: number;
  saldoPendiente: number;
  fechaEmision: string;
  fechaVencimiento: string;
  abonado: { nombre: string; cedula: string; direccion: string; sector: string };
  periodo: { anio: number; mes: number };
  lineas: Array<{
    id: string;
    medidor: { numeroSerie: string; marca: string };
    consumo: number;
    precioM3: number;
    monto: number;
    lecturaAnterior: { valor: number; fecha: string } | null;
    lecturaActual: { valor: number; fecha: string };
  }>;
  pagos: Array<{
    id: string;
    monto: number;
    metodo: string;
    origen?: string;
    canal?: string | null;
    referencia: string | null;
    fecha: string;
    registradoPor: { nombre: string } | null;
  }>;
}

const metodoLabels: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  OTRO: 'Otro',
  PACIFICO_VENTANILLA: 'Banco Pacífico — Ventanilla',
  PACIFICO_BANCA_WEB: 'Banco Pacífico — Banca web',
  PACIFICO_BANCA_MOVIL: 'Banco Pacífico — Banca móvil',
};

const statusLabels: Record<string, string> = {
  EMITIDA: 'Emitida',
  PAGADA: 'Pagada',
  VENCIDA: 'Vencida',
  ANULADA: 'Anulada',
};

export default function FacturaDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState<'EFECTIVO' | 'TRANSFERENCIA' | 'OTRO'>('EFECTIVO');
  const [referencia, setReferencia] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['billing-factura', id],
    queryFn: () => apiFetch<FacturaDetalle>(`/billing/facturas/${id}`),
  });

  const registrarPago = useMutation({
    mutationFn: () =>
      apiFetch(`/billing/facturas/${id}/pagos`, {
        method: 'POST',
        body: JSON.stringify({
          monto: parseFloat(monto),
          metodo,
          referencia: referencia || undefined,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-factura', id] });
      queryClient.invalidateQueries({ queryKey: ['billing-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['billing-facturas'] });
      setMonto('');
      setReferencia('');
    },
  });

  if (isLoading) return <p>Cargando factura...</p>;
  if (!data) return <p>Factura no encontrada</p>;

  return (
    <div>
      <Link href="/facturacion" className="text-sky-700 text-sm hover:underline">
        ← Volver a facturación
      </Link>

      <div className="mt-4 bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-mono">{data.numero}</h1>
            <p className="text-slate-600 mt-1">
              {data.abonado.nombre} — {data.abonado.cedula}
            </p>
            <p className="text-sm text-slate-500">
              {data.abonado.direccion}, {data.abonado.sector}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-slate-100 px-3 py-1 rounded text-sm">
              {statusLabels[data.status] ?? data.status}
            </span>
            <p className="text-2xl font-bold mt-2">${data.total.toFixed(2)}</p>
            {data.saldoPendiente > 0 && (
              <p className="text-sm text-amber-700">Saldo: ${data.saldoPendiente.toFixed(2)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Detalle de consumo</h2>
          <div className="space-y-4">
            {data.lineas.map((l) => (
              <div key={l.id} className="border rounded p-4 text-sm">
                <p className="font-medium">
                  Medidor {l.medidor.numeroSerie} ({l.medidor.marca})
                </p>
                <p className="text-slate-600 mt-1">
                  Lectura anterior:{' '}
                  {l.lecturaAnterior
                    ? `${l.lecturaAnterior.valor} m³`
                    : 'Primera lectura (referencia)'}
                </p>
                <p className="text-slate-600">
                  Lectura actual: {l.lecturaActual.valor} m³
                </p>
                <p className="mt-2">
                  Consumo: <strong>{l.consumo.toFixed(2)} m³</strong> × ${l.precioM3.toFixed(2)} ={' '}
                  <strong>${l.monto.toFixed(2)}</strong>
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t text-sm space-y-1">
            <p>Subtotal consumo: ${data.subtotal.toFixed(2)}</p>
            <p>Cargo fijo: ${data.cargoFijo.toFixed(2)}</p>
            <p className="font-bold">Total: ${data.total.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4">Pagos registrados</h2>
            {data.pagos.length === 0 ? (
              <p className="text-sm text-slate-500">Sin pagos registrados</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.pagos.map((p) => (
                  <li key={p.id} className="border-b pb-2">
                    <strong>${p.monto.toFixed(2)}</strong> — {metodoLabels[p.metodo] ?? p.metodo}
                    {p.origen === 'BANCO_PACIFICO' && (
                      <span className="text-xs text-sky-700 ml-1">(automático)</span>
                    )}
                    {p.referencia && ` · Ref: ${p.referencia}`}
                    <div className="text-xs text-slate-500">
                      {new Date(p.fecha).toLocaleString('es-EC')}
                      {p.registradoPor ? ` · ${p.registradoPor.nombre}` : ' · Banco Pacífico'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {data.status !== 'PAGADA' && data.status !== 'ANULADA' && (
            <div className="bg-white rounded-lg shadow p-6 border border-dashed border-slate-300">
              <h2 className="font-semibold mb-1">Cobro interno (respaldo)</h2>
              <p className="text-xs text-slate-500 mb-4">
                El canal principal es Banco Pacífico. Use esto solo para cobros excepcionales en oficina.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm block mb-1">Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={data.saldoPendiente}
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="w-full border rounded p-2 text-sm"
                    placeholder={data.saldoPendiente.toFixed(2)}
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">Método</label>
                  <select
                    value={metodo}
                    onChange={(e) =>
                      setMetodo(e.target.value as 'EFECTIVO' | 'TRANSFERENCIA' | 'OTRO')
                    }
                    className="w-full border rounded p-2 text-sm"
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm block mb-1">Referencia (opcional)</label>
                  <input
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    className="w-full border rounded p-2 text-sm"
                    placeholder="Nº comprobante, recibo..."
                  />
                </div>
                <button
                  onClick={() => registrarPago.mutate()}
                  disabled={registrarPago.isPending || !monto || parseFloat(monto) <= 0}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {registrarPago.isPending ? 'Registrando...' : 'Registrar pago'}
                </button>
                {registrarPago.isError && (
                  <p className="text-red-600 text-sm">
                    {registrarPago.error instanceof Error
                      ? registrarPago.error.message
                      : 'Error al registrar pago'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
