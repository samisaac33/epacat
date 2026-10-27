'use client';

import { useMutation, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface DeudaItem {
  referencia: string;
  concepto: string;
  monto: number;
  vencimiento: string;
}

interface ConsultaResponse {
  identificacion: string;
  nombre: string;
  deudas: DeudaItem[];
  totalPendiente: number;
}

export default function SimuladorPacificoPage() {
  const [identificacion, setIdentificacion] = useState('1301234567');
  const [consulta, setConsulta] = useState<ConsultaResponse | null>(null);
  const [canal, setCanal] = useState<'VENTANILLA' | 'BANCA_WEB' | 'BANCA_MOVIL'>('VENTANILLA');
  const [mensaje, setMensaje] = useState('');

  const consultar = useMutation({
    mutationFn: () =>
      apiFetch<ConsultaResponse>('/recaudacion/simular/consulta', {
        method: 'POST',
        body: JSON.stringify({ identificacion }),
      }),
    onSuccess: (data) => {
      setConsulta(data);
      setMensaje('');
    },
  });

  const pagar = useMutation({
    mutationFn: (deuda: DeudaItem) =>
      apiFetch('/recaudacion/simular/pago', {
        method: 'POST',
        body: JSON.stringify({
          transaccionId: `BP-SIM-${Date.now()}`,
          identificacion,
          referencia: deuda.referencia,
          monto: deuda.monto,
          canal,
        }),
      }),
    onSuccess: () => {
      setMensaje('Pago procesado. EPIM actualizado y comprobante enviado por correo (si hay email).');
      consultar.mutate();
    },
  });

  return (
    <div>
      <Link href="/facturacion" className="text-sky-700 text-sm hover:underline">
        ← Volver a facturación
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-2">Simulador Banco Pacífico</h1>
      <p className="text-sm text-slate-600 mb-6">
        Demo del convenio de recaudación: consulta de deuda y notificación de pago por cédula o RUC.
        Cuenta institucional EPA: {process.env.NEXT_PUBLIC_EPA_CUENTA_BANCO ?? '0000-0000-0000'}
      </p>

      <div className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
        <div>
          <label className="text-sm block mb-1">Cédula o RUC del abonado</label>
          <input
            value={identificacion}
            onChange={(e) => setIdentificacion(e.target.value)}
            className="w-full max-w-md border rounded p-2 text-sm"
            placeholder="1301234567"
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Canal de pago</label>
          <select
            value={canal}
            onChange={(e) => setCanal(e.target.value as typeof canal)}
            className="border rounded p-2 text-sm"
          >
            <option value="VENTANILLA">Ventanilla</option>
            <option value="BANCA_WEB">Banca web</option>
            <option value="BANCA_MOVIL">Banca móvil</option>
          </select>
        </div>
        <button
          onClick={() => consultar.mutate()}
          disabled={consultar.isPending || !identificacion}
          className="bg-sky-700 text-white px-4 py-2 rounded hover:bg-sky-600 disabled:opacity-50"
        >
          {consultar.isPending ? 'Consultando...' : 'Consultar deuda'}
        </button>
      </div>

      {consulta && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-lg">{consulta.nombre}</h2>
          <p className="text-sm text-slate-600 mb-4">
            {consulta.identificacion} — Total pendiente: ${consulta.totalPendiente.toFixed(2)}
          </p>
          {consulta.deudas.length === 0 ? (
            <p className="text-slate-500">Sin deudas pendientes.</p>
          ) : (
            <ul className="space-y-3">
              {consulta.deudas.map((d) => (
                <li key={d.referencia} className="border rounded p-4 flex justify-between items-center gap-4">
                  <div>
                    <p className="font-mono text-sm">{d.referencia}</p>
                    <p className="text-sm text-slate-600">{d.concepto}</p>
                    <p className="text-sm">
                      Vence: {new Date(d.vencimiento).toLocaleDateString('es-EC')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${d.monto.toFixed(2)}</p>
                    <button
                      onClick={() => pagar.mutate(d)}
                      disabled={pagar.isPending}
                      className="mt-2 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Simular pago
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {mensaje && <p className="mt-4 text-green-700 text-sm">{mensaje}</p>}
      {(consultar.isError || pagar.isError) && (
        <p className="mt-4 text-red-600 text-sm">
          {(consultar.error ?? pagar.error) instanceof Error
            ? (consultar.error ?? pagar.error)?.message
            : 'Error en simulación'}
        </p>
      )}
    </div>
  );
}
