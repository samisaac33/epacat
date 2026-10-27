'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { webApiFetch } from '@/lib/api';

interface AnalisisResumen {
  totalFilasEpa: number;
  filasConCruce: number;
  filasSinCruce: number;
  cuentasEpaActivas: number;
  desalineacionesEpaActivoNoVigente: number;
  montoCobradoAsumidoTotalUsd: number;
  montoDebeCobrarTotalUsd: number;
  sobreRecaudacionTotalUsd: number;
}

interface AnalisisFila {
  cuentaUsuario: string;
  razonSocial: string;
  identificacion: string;
  codigoUnico: string;
  estadoContratoEpa: string;
  estadoTramiteRuaa: string | null;
  matchMethod: string;
  caudalFijoLs: number;
  tarifaUsdM3: number;
  tarifaOrigen: string;
  montoTeoricoAnualUsd: number;
  debeCobrar: boolean;
  montoCobradoAsumidoUsd: number;
  sobreRecaudacionUsd: number;
  desalineacionEpaActivo: boolean;
}

interface AnalisisPorEstado {
  estadoTramite: string;
  cantidad: number;
  cantidadDebeCobrar?: number;
  montoDebeCobrarUsd?: number;
  montoCobradoAsumidoUsd?: number;
  montoTeoricoAnualUsd: number;
  esEstadoCobrable?: boolean;
}

interface AnalisisDistribucionCruce {
  clave: string;
  etiqueta: string;
  cantidad: number;
  esEstadoCobrable: boolean;
}

interface AnalisisMontoRegla {
  clave: string;
  etiqueta: string;
  descripcion: string;
  cantidad: number;
  montoUsd: number;
}

interface AnalisisSnapshotMeta {
  id: string;
  titulo: string;
  descripcion: string;
  generatedAt: string;
  criterioCobro: string;
  fuenteRuaa: string;
  fuenteEpa: string;
  fechaReporteEpa: string | null;
}

interface AnalisisSnapshot {
  meta: AnalisisSnapshotMeta;
  result: {
    resumen: AnalisisResumen;
    filas: AnalisisFila[];
    sinCruce: AnalisisFila[];
    porEstadoTramite: AnalisisPorEstado[];
    distribucionCruce?: AnalisisDistribucionCruce[];
    montosPorRegla?: AnalisisMontoRegla[];
    parseWarnings: string[];
  };
}

function fmtUsd(n: number) {
  return n.toLocaleString('es-EC', { style: 'currency', currency: 'USD' });
}

function estadoRuaaCobrable(estado: string | null) {
  return estado === 'VIGENTE' || estado === 'RENOVADO';
}

function fmtFecha(iso: string) {
  try {
    return new Date(iso).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function downloadCsv(filas: AnalisisFila[]) {
  const headers = [
    'cuentaUsuario',
    'razonSocial',
    'identificacion',
    'codigoUnico',
    'estadoContratoEpa',
    'estadoTramiteRuaa',
    'caudalFijoLs',
    'tarifaUsdM3',
    'montoTeoricoAnualUsd',
    'debeCobrar',
    'montoCobradoAsumidoUsd',
    'sobreRecaudacionUsd',
    'desalineacionEpaActivo',
  ];
  const escape = (v: string | number | boolean) => {
    const s = String(v);
    return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(','),
    ...filas.map((f) =>
      headers.map((h) => escape((f as Record<string, string | number | boolean>)[h] ?? '')).join(','),
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analisis-comercial-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ComercialPage() {
  const [filtro, setFiltro] = useState<'todos' | 'desalineacion' | 'sin_cruce' | 'sobre_recaudacion'>(
    'todos',
  );

  const { data: tarifas } = useQuery({
    queryKey: ['comercial-tarifas'],
    queryFn: () =>
      webApiFetch<{ id: string; uso: string; detalle: string; tarifaUsdM3: number }[]>(
        '/api/comercial/tarifas',
      ),
  });

  const {
    data: snapshot,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['comercial-analisis'],
    queryFn: () => webApiFetch<AnalisisSnapshot>('/api/comercial/analisis'),
  });

  const analisis = snapshot?.result;

  const filasVisibles = useMemo(() => {
    if (!analisis) return [];
    let list = analisis.filas;
    if (filtro === 'desalineacion') list = list.filter((f) => f.desalineacionEpaActivo);
    if (filtro === 'sin_cruce') list = list.filter((f) => f.matchMethod === 'none');
    if (filtro === 'sobre_recaudacion') list = list.filter((f) => f.sobreRecaudacionUsd > 0.001);
    return list;
  }, [analisis, filtro]);

  const distribucion = useMemo(() => {
    if (!analisis) return [];
    if (analisis.distribucionCruce?.length) return analisis.distribucionCruce;
    const rows: AnalisisDistribucionCruce[] = analisis.porEstadoTramite.map((e) => ({
      clave: e.estadoTramite,
      etiqueta: e.estadoTramite,
      cantidad: e.cantidad,
      esEstadoCobrable: e.esEstadoCobrable ?? estadoRuaaCobrable(e.estadoTramite),
    }));
    if (snapshot?.result.resumen.filasSinCruce) {
      rows.push({
        clave: 'SIN_CRUCE',
        etiqueta: 'Sin cruce RUAA',
        cantidad: snapshot.result.resumen.filasSinCruce,
        esEstadoCobrable: false,
      });
    }
    return rows.sort((a, b) => b.cantidad - a.cantidad);
  }, [analisis, snapshot?.result.resumen.filasSinCruce]);

  const maxDistribucion = useMemo(() => {
    if (!distribucion.length) return 1;
    return Math.max(...distribucion.map((e) => e.cantidad), 1);
  }, [distribucion]);

  const montosRegla = useMemo(() => {
    if (!analisis || !snapshot) return [];
    if (analisis.montosPorRegla?.length) return analisis.montosPorRegla;
    const r = snapshot.result.resumen;
    return [
      {
        clave: 'ruaa_debe_cobrar',
        etiqueta: 'Recaudación conforme RUAA',
        descripcion: 'VIGENTE o RENOVADO, uso sujeto a recaudación',
        cantidad: analisis.filas.filter((f) => f.debeCobrar).length,
        montoUsd: r.montoDebeCobrarTotalUsd,
      },
      {
        clave: 'epa_activo_asumido',
        etiqueta: 'Cobro asumido EPA (Activo)',
        descripcion: 'Facturación inferida para cuentas Activo',
        cantidad: analisis.filas.filter((f) => f.montoCobradoAsumidoUsd > 0).length,
        montoUsd: r.montoCobradoAsumidoTotalUsd,
      },
      {
        clave: 'brecha_sobre_recaudacion',
        etiqueta: 'Brecha (sobre-recaudación neta)',
        descripcion: 'Diferencia entre cobro EPA y lo debido por RUAA',
        cantidad: analisis.filas.filter((f) => f.sobreRecaudacionUsd > 0.001).length,
        montoUsd: r.sobreRecaudacionTotalUsd,
      },
    ] as AnalisisMontoRegla[];
  }, [analisis, snapshot]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{snapshot?.meta.titulo ?? 'Área comercial — cruce RUAA / EPA'}</h1>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          {snapshot?.meta.descripcion ??
            'Cruce del reporte RUAA (RPA) con cuentas EPA EP y estimación de recaudación anual.'}
        </p>
        {snapshot?.meta && (
          <dl className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600">
            <div>
              <dt className="text-slate-500">Criterio de cobro</dt>
              <dd>{snapshot.meta.criterioCobro}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Fuentes</dt>
              <dd>
                {snapshot.meta.fuenteRuaa}; {snapshot.meta.fuenteEpa}
                {snapshot.meta.fechaReporteEpa ? ` (${snapshot.meta.fechaReporteEpa})` : ''}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Snapshot generado</dt>
              <dd>{fmtFecha(snapshot.meta.generatedAt)}</dd>
            </div>
          </dl>
        )}
      </div>

      {isLoading && (
        <p className="text-sm text-slate-600">Cargando análisis…</p>
      )}

      {isError && (
        <p className="text-sm text-red-600">{(error as Error).message}</p>
      )}

      {analisis && (
        <>
          {analisis.parseWarnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
              <p className="font-medium mb-1">Advertencias de parseo</p>
              <ul className="list-disc pl-5 space-y-1">
                {analisis.parseWarnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-2">Cobertura del cruce</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Kpi
                title="Cuentas en reporte EPA"
                value={String(analisis.resumen.totalFilasEpa)}
                subtitle="Filas del extracto EPA EP"
              />
              <Kpi
                title="Con match RUAA"
                value={String(analisis.resumen.filasConCruce)}
                subtitle="Autorización RUAA enlazada por código o cédula"
              />
              <Kpi
                title="Sin cruce RUAA"
                value={String(analisis.resumen.filasSinCruce)}
                subtitle="Sin fila RUAA asociada en este cruce"
              />
              <Kpi
                title="EPA Activo (contrato)"
                value={String(analisis.resumen.cuentasEpaActivas)}
                subtitle="Estado contrato EPA; no sustituye al trámite RUAA"
              />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-1">Recaudación anual estimada</h2>
            <p className="text-xs text-slate-500 mb-2 max-w-3xl">
              Brecha = cobro asumido EPA (cuentas Activo) menos recaudación conforme RUAA (VIGENTE /
              RENOVADO y usos sujetos a tarifa).
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <Kpi
                title="Cobro asumido EPA (Activo)"
                value={fmtUsd(analisis.resumen.montoCobradoAsumidoTotalUsd)}
                subtitle="Si EPA factura al caudal/tarifa inferidos"
              />
              <Kpi
                title="Recaudación conforme RUAA"
                value={fmtUsd(analisis.resumen.montoDebeCobrarTotalUsd)}
                subtitle="VIGENTE o RENOVADO, sujeto a recaudación"
              />
              <Kpi
                title="Brecha (sobre-recaudación neta)"
                value={fmtUsd(analisis.resumen.sobreRecaudacionTotalUsd)}
                subtitle="Suma por cuenta: cobrado asumido − debido"
                highlight
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold mb-1">Distribución del cruce (cuentas)</h2>
              <p className="text-xs text-slate-500 mb-4">
                Una barra = una cuenta EPA. Estado = trámite RUAA enlazado (o sin cruce).
              </p>
              <div className="space-y-2">
                {distribucion.map((e) => (
                  <div key={e.clave}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{e.etiqueta}</span>
                      <span className="text-slate-600 tabular-nums">{e.cantidad} cuentas</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded overflow-hidden">
                      <div
                        className={`h-full ${e.esEstadoCobrable ? 'bg-emerald-600' : e.clave === 'SIN_CRUCE' ? 'bg-amber-500' : 'bg-slate-400'}`}
                        style={{ width: `${(e.cantidad / maxDistribucion) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Desalineaciones (EPA Activo + RUAA no VIGENTE/RENOVADO):{' '}
                {analisis.resumen.desalineacionesEpaActivoNoVigente}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold mb-1">Montos por regla de cobro</h2>
              <p className="text-xs text-slate-500 mb-4">
                Alineado con los KPI de recaudación; no usar el monto teórico bruto por estado.
              </p>
              <div className="overflow-x-auto text-sm">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-500 border-b">
                      <th className="py-2 pr-2">Regla</th>
                      <th className="py-2 pr-2 text-right">Cuentas</th>
                      <th className="py-2 text-right">USD/año</th>
                    </tr>
                  </thead>
                  <tbody>
                    {montosRegla.map((m) => (
                      <tr key={m.clave} className="border-b border-slate-50 align-top">
                        <td className="py-2 pr-2">
                          <span className="font-medium">{m.etiqueta}</span>
                          <p className="text-xs text-slate-500 mt-0.5">{m.descripcion}</p>
                        </td>
                        <td className="py-2 pr-2 text-right tabular-nums">{m.cantidad}</td>
                        <td
                          className={`py-2 text-right tabular-nums font-mono ${m.clave === 'brecha_sobre_recaudacion' ? 'text-red-700' : ''}`}
                        >
                          {fmtUsd(m.montoUsd)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
              <h2 className="font-semibold mb-1">Detalle por estado RUAA (con cruce)</h2>
              <p className="text-xs text-slate-500 mb-4">
                Columna «Conforme RUAA» = suma donde aplica cobro legal; «Teórico» = caudal × tarifa
                (referencia).
              </p>
              <div className="overflow-x-auto text-sm max-h-64 overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-500 border-b">
                      <th className="py-1 pr-2">Estado</th>
                      <th className="py-1 pr-2 text-right">Cuentas</th>
                      <th className="py-1 pr-2 text-right">Conforme RUAA</th>
                      <th className="py-1 text-right">Teórico</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analisis.porEstadoTramite.map((e) => (
                      <tr key={e.estadoTramite} className="border-b border-slate-50">
                        <td className="py-1 pr-2">{e.estadoTramite}</td>
                        <td className="py-1 pr-2 text-right tabular-nums">{e.cantidad}</td>
                        <td className="py-1 pr-2 text-right tabular-nums font-mono text-emerald-800">
                          {fmtUsd(e.montoDebeCobrarUsd ?? 0)}
                          {(e.cantidadDebeCobrar ?? 0) > 0 && (
                            <span className="text-xs text-slate-500 block">
                              {e.cantidadDebeCobrar} cuentas
                            </span>
                          )}
                        </td>
                        <td className="py-1 text-right tabular-nums font-mono text-slate-600">
                          {fmtUsd(e.montoTeoricoAnualUsd)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold mb-4">Tarifas de referencia (US$/m³)</h2>
              <div className="max-h-64 overflow-y-auto text-sm">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-500 border-b">
                      <th className="py-1">Uso</th>
                      <th className="py-1">Detalle</th>
                      <th className="py-1 text-right">Tarifa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tarifas ?? []).map((t) => (
                      <tr key={t.id} className="border-b border-slate-50">
                        <td className="py-1 pr-2">{t.uso}</td>
                        <td className="py-1 pr-2 text-slate-600">{t.detalle}</td>
                        <td className="py-1 text-right font-mono">{t.tarifaUsdM3}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-semibold">Detalle por cuenta</h2>
              <div className="flex flex-wrap gap-2 items-center">
                <select
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value as typeof filtro)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="todos">Todas</option>
                  <option value="desalineacion">EPA Activo / RUAA no cobrable</option>
                  <option value="sobre_recaudacion">Con sobre-recaudación</option>
                  <option value="sin_cruce">Sin cruce RUAA</option>
                </select>
                <button
                  type="button"
                  onClick={() => downloadCsv(filasVisibles)}
                  className="text-sm border rounded px-3 py-1 hover:bg-slate-50"
                >
                  Exportar CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-2">Cuenta</th>
                    <th className="py-2 pr-2">Titular</th>
                    <th className="py-2 pr-2">Código único</th>
                    <th className="py-2 pr-2">EPA / RUAA</th>
                    <th className="py-2 pr-2 text-right">Caudal</th>
                    <th className="py-2 pr-2 text-right">Anual est.</th>
                    <th className="py-2 text-right">Sobre-rec.</th>
                  </tr>
                </thead>
                <tbody>
                  {filasVisibles.slice(0, 200).map((f) => (
                    <tr key={`${f.cuentaUsuario}-${f.codigoUnico}`} className="border-b border-slate-50">
                      <td className="py-2 pr-2 font-mono">{f.cuentaUsuario}</td>
                      <td className="py-2 pr-2 max-w-[160px] truncate" title={f.razonSocial}>
                        {f.razonSocial}
                      </td>
                      <td className="py-2 pr-2 font-mono text-xs">{f.codigoUnico || '—'}</td>
                      <td className="py-2 pr-2">
                        <span className={f.estadoContratoEpa === 'Activo' ? 'text-emerald-700' : 'text-slate-500'}>
                          {f.estadoContratoEpa}
                        </span>
                        {' / '}
                        <span
                          className={
                            estadoRuaaCobrable(f.estadoTramiteRuaa)
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }
                        >
                          {f.estadoTramiteRuaa ?? '—'}
                        </span>
                      </td>
                      <td className="py-2 pr-2 text-right">{f.caudalFijoLs.toFixed(4)}</td>
                      <td className="py-2 pr-2 text-right">{fmtUsd(f.montoTeoricoAnualUsd)}</td>
                      <td className="py-2 text-right text-red-700">
                        {f.sobreRecaudacionUsd > 0 ? fmtUsd(f.sobreRecaudacionUsd) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filasVisibles.length > 200 && (
                <p className="text-xs text-slate-500 mt-2">
                  Mostrando 200 de {filasVisibles.length} filas. Exporte CSV para el listado completo.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({
  title,
  value,
  subtitle,
  highlight,
}: {
  title: string;
  value: string;
  subtitle?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg shadow p-4 ${highlight ? 'bg-red-50 border border-red-100' : 'bg-white'}`}>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{title}</p>
      <p className={`text-xl font-bold mt-1 ${highlight ? 'text-red-800' : ''}`}>{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-2 leading-snug">{subtitle}</p>}
    </div>
  );
}
