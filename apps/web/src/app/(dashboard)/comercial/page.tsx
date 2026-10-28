'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { webApiFetch } from '@/lib/api';

interface AnalisisResumen {
  totalFilasEpa: number;
  filasConCruce: number;
  filasSinCruce: number;
  filasMatchBajaConfianza?: number;
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
  matchConfianza?: 'alta' | 'media' | 'baja' | null;
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

interface RuaaResumen {
  totalFilas: number;
  porEstadoTramite: { estadoTramite: string; cantidad: number }[];
  codigosUnicosDistintos: number;
  codigosConMasDeUnaFila: number;
  filasEnCodigosRepetidos: number;
  cedulasConMasDeUnaFila: number;
}

interface EpaResumen {
  totalFilas: number;
  cuentasActivas: number;
  codigosUnicosLiterales: number;
  codigosUnicosNormalizados: number;
  sinCodigoNormalizado: number;
}

interface CruceEstadisticas {
  filasEpaConMatch: number;
  matchPorCodigo: number;
  matchPorCedula: number;
  matchPorCedulaNormalizada?: number;
  matchPorCodigoEstema?: number;
  matchBajaConfianza?: number;
  filasSinMatch: number;
  codigosNormalizadosEnAmbosFuentes: number;
  filasEpaConCodigoPresenteEnRuaa: number;
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
  ruaaResumen?: RuaaResumen;
  epaResumen?: EpaResumen;
  cruceEstadisticas?: CruceEstadisticas;
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

function matchConfirmado(f: AnalisisFila) {
  return f.matchMethod !== 'none' && f.matchConfianza !== 'baja';
}

/** ¿Cuenta este match hacia «conforme RUAA» según el switch? */
function debeCobrarEnVista(f: AnalisisFila, incluyeAmpliado: boolean) {
  if (!f.debeCobrar) return false;
  if (incluyeAmpliado) return true;
  return f.matchConfianza !== 'baja';
}

function montoDebidoEnVista(f: AnalisisFila, incluyeAmpliado: boolean) {
  return debeCobrarEnVista(f, incluyeAmpliado) ? f.montoTeoricoAnualUsd : 0;
}

function sobreRecaudacionEnVista(f: AnalisisFila, incluyeAmpliado: boolean) {
  return f.montoCobradoAsumidoUsd - montoDebidoEnVista(f, incluyeAmpliado);
}

function agregarRecaudacion(filas: AnalisisFila[], incluyeAmpliado: boolean) {
  let montoDebeCobrarUsd = 0;
  let cuentasDebeCobrar = 0;
  let sobreRecaudacionUsd = 0;
  let cuentasSobreRecaudacion = 0;
  for (const f of filas) {
    if (debeCobrarEnVista(f, incluyeAmpliado)) {
      cuentasDebeCobrar += 1;
      montoDebeCobrarUsd += f.montoTeoricoAnualUsd;
    }
    const sobre = sobreRecaudacionEnVista(f, incluyeAmpliado);
    sobreRecaudacionUsd += sobre;
    if (sobre > 0.001) cuentasSobreRecaudacion += 1;
  }
  const montoCobradoAsumidoUsd = filas.reduce((s, f) => s + f.montoCobradoAsumidoUsd, 0);
  return {
    montoDebeCobrarUsd,
    cuentasDebeCobrar,
    montoCobradoAsumidoUsd,
    sobreRecaudacionUsd,
    cuentasSobreRecaudacion,
    filasConCruce: filas.filter((f) => f.matchMethod !== 'none').length,
    filasConCruceConfirmado: filas.filter(matchConfirmado).length,
  };
}

function downloadCsv(filas: AnalisisFila[]) {
  const headers = [
    'cuentaUsuario',
    'razonSocial',
    'identificacion',
    'codigoUnico',
    'estadoContratoEpa',
    'estadoTramiteRuaa',
    'matchMethod',
    'matchConfianza',
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
  const [incluyeAmpliado, setIncluyeAmpliado] = useState(false);
  const [filtro, setFiltro] = useState<
    'todos' | 'desalineacion' | 'sin_cruce' | 'sobre_recaudacion' | 'match_baja'
  >('todos');

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

  const totalesRecaudacion = useMemo(() => {
    if (!analisis) return null;
    const confirmado = agregarRecaudacion(analisis.filas, false);
    const ampliado = agregarRecaudacion(analisis.filas, true);
    const activo = incluyeAmpliado ? ampliado : confirmado;
    return { confirmado, ampliado, activo };
  }, [analisis, incluyeAmpliado]);

  const filasVisibles = useMemo(() => {
    if (!analisis) return [];
    let list = analisis.filas;
    if (filtro === 'desalineacion') list = list.filter((f) => f.desalineacionEpaActivo);
    if (filtro === 'sin_cruce') list = list.filter((f) => f.matchMethod === 'none');
    if (filtro === 'sobre_recaudacion') {
      list = list.filter((f) => sobreRecaudacionEnVista(f, incluyeAmpliado) > 0.001);
    }
    if (filtro === 'match_baja') list = list.filter((f) => f.matchConfianza === 'baja');
    return list;
  }, [analisis, filtro, incluyeAmpliado]);

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
    if (!analisis || !totalesRecaudacion) return [];
    const t = totalesRecaudacion.activo;
    const modo = incluyeAmpliado
      ? 'Incluye cruce ampliado (estema / cédula norm.)'
      : 'Solo match confirmado (código o cédula)';
    return [
      {
        clave: 'ruaa_debe_cobrar',
        etiqueta: 'Recaudación conforme RUAA',
        descripcion: `VIGENTE o RENOVADO, sujeto a recaudación. ${modo}`,
        cantidad: t.cuentasDebeCobrar,
        montoUsd: t.montoDebeCobrarUsd,
      },
      {
        clave: 'epa_activo_asumido',
        etiqueta: 'Cobro asumido EPA (Activo)',
        descripcion: 'Facturación inferida para cuentas Activo',
        cantidad: analisis.filas.filter((f) => f.montoCobradoAsumidoUsd > 0).length,
        montoUsd: t.montoCobradoAsumidoUsd,
      },
      {
        clave: 'brecha_sobre_recaudacion',
        etiqueta: 'Brecha (sobre-recaudación neta)',
        descripcion: `Cobro asumido EPA menos debido por RUAA. ${modo}`,
        cantidad: t.cuentasSobreRecaudacion,
        montoUsd: t.sobreRecaudacionUsd,
      },
      {
        clave: 'desalineacion_activo',
        etiqueta: 'Desalineación EPA Activo',
        descripcion: 'Activo en EPA con RUAA no VIGENTE/RENOVADO (cobro asumido)',
        cantidad: analisis.filas.filter(
          (f) =>
            f.desalineacionEpaActivo && (incluyeAmpliado || f.matchConfianza !== 'baja'),
        ).length,
        montoUsd: analisis.filas
          .filter((f) => f.desalineacionEpaActivo && (incluyeAmpliado || f.matchConfianza !== 'baja'))
          .reduce((s, f) => s + f.montoCobradoAsumidoUsd, 0),
      },
      {
        clave: 'sin_cruce',
        etiqueta: 'Sin cruce RUAA',
        descripcion: 'Cuentas EPA sin match; cobro asumido solo si Activo',
        cantidad: analisis.filas.filter((f) => f.matchMethod === 'none').length,
        montoUsd: analisis.filas
          .filter((f) => f.matchMethod === 'none')
          .reduce((s, f) => s + f.montoCobradoAsumidoUsd, 0),
      },
    ] as AnalisisMontoRegla[];
  }, [analisis, incluyeAmpliado, totalesRecaudacion]);

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

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-700">Vista de recaudación</h2>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={incluyeAmpliado}
                onChange={(e) => setIncluyeAmpliado(e.target.checked)}
                className="rounded border-slate-300"
              />
              Incluir cruce ampliado (baja confianza)
            </label>
          </div>
          <p className="text-xs text-slate-500 -mt-4 max-w-3xl">
            Con el switch apagado, la brecha y «Montos por regla» usan solo matches confirmados (código
            o cédula). Los dos totales conforme RUAA se muestran siempre para comparar.
          </p>

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
                value={
                  totalesRecaudacion
                    ? String(
                        incluyeAmpliado
                          ? totalesRecaudacion.ampliado.filasConCruce
                          : totalesRecaudacion.confirmado.filasConCruceConfirmado,
                      )
                    : String(analisis.resumen.filasConCruce)
                }
                subtitle={
                  totalesRecaudacion
                    ? incluyeAmpliado
                      ? `${totalesRecaudacion.confirmado.filasConCruceConfirmado} confirmados + ${analisis.resumen.filasMatchBajaConfianza ?? 0} ampliado`
                      : `${totalesRecaudacion.ampliado.filasConCruce} si incluye ampliado`
                    : 'Código o cédula (+ ampliado opcional)'
                }
              />
              <Kpi
                title="Sin cruce RUAA"
                value={String(analisis.resumen.filasSinCruce)}
                subtitle="Sin fila RUAA asociada tras todas las reglas"
              />
              <Kpi
                title="EPA Activo (contrato)"
                value={String(analisis.resumen.cuentasEpaActivas)}
                subtitle="Estado contrato EPA; no sustituye al trámite RUAA"
              />
            </div>
          </div>

          {(snapshot.meta.epaResumen || snapshot.meta.cruceEstadisticas) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold mb-1">Censo EPA EP y cruce por clave</h2>
              <p className="text-xs text-slate-500 mb-4 max-w-3xl">
                El reporte EPA tiene {snapshot.meta.epaResumen?.totalFilas ?? analisis.resumen.totalFilasEpa}{' '}
                cuentas. Cruce: código (alta), cédula+caudal (media), estema o cédula normalizada (baja).
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {snapshot.meta.epaResumen && (
                  <>
                    <Kpi
                      title="Códigos únicos EPA (literal)"
                      value={String(snapshot.meta.epaResumen.codigosUnicosLiterales)}
                      subtitle="Un código por fila en el CSV"
                    />
                    <Kpi
                      title="Códigos únicos EPA (normalizados)"
                      value={String(snapshot.meta.epaResumen.codigosUnicosNormalizados)}
                      subtitle="Tras reglas MA-… / sin PENDIENTE"
                    />
                  </>
                )}
                {snapshot.meta.cruceEstadisticas && (
                  <>
                    <Kpi
                      title="Códigos norm. en RUAA y EPA"
                      value={String(snapshot.meta.cruceEstadisticas.codigosNormalizadosEnAmbosFuentes)}
                      subtitle="Intersección de conjuntos (no = match)"
                    />
                    <Kpi
                      title="Match por código único"
                      value={String(snapshot.meta.cruceEstadisticas.matchPorCodigo)}
                      subtitle={`+ ${snapshot.meta.cruceEstadisticas.matchPorCedula} cédula literal`}
                    />
                    {(snapshot.meta.cruceEstadisticas.matchPorCodigoEstema != null ||
                      snapshot.meta.cruceEstadisticas.matchBajaConfianza != null) && (
                      <Kpi
                        title="Cruce ampliado (baja conf.)"
                        value={String(snapshot.meta.cruceEstadisticas.matchBajaConfianza ?? 0)}
                        subtitle={`${snapshot.meta.cruceEstadisticas.matchPorCodigoEstema ?? 0} estema, ${snapshot.meta.cruceEstadisticas.matchPorCedulaNormalizada ?? 0} cédula norm.`}
                      />
                    )}
                  </>
                )}
              </div>
              {snapshot.meta.cruceEstadisticas && (
                <p className="text-sm text-slate-700">
                  <strong>{snapshot.meta.cruceEstadisticas.filasEpaConMatch}</strong> cuentas EPA con match (
                  {snapshot.meta.cruceEstadisticas.matchPorCodigo} código,{' '}
                  {snapshot.meta.cruceEstadisticas.matchPorCedula} cédula,{' '}
                  {snapshot.meta.cruceEstadisticas.matchPorCodigoEstema ?? 0} estema,{' '}
                  {snapshot.meta.cruceEstadisticas.matchPorCedulaNormalizada ?? 0} cédula norm.);{' '}
                  <strong>{snapshot.meta.cruceEstadisticas.filasSinMatch}</strong> sin match.
                </p>
              )}
            </div>
          )}

          {snapshot.meta.ruaaResumen && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold mb-1">Censo RUAA (export completo — {snapshot.meta.ruaaResumen.totalFilas} filas)</h2>
              <p className="text-xs text-slate-500 mb-4 max-w-3xl">
                Todas las autorizaciones del archivo RUAA, independiente del cruce EPA. Varios registros
                pueden compartir el mismo código o cédula (históricos, modificaciones). En el cruce EPA
                solo se usa una fila RUAA por cuenta.
              </p>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="overflow-x-auto text-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-slate-500 border-b">
                        <th className="py-1 pr-2">estado_tramite</th>
                        <th className="py-1 text-right">Filas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshot.meta.ruaaResumen.porEstadoTramite.map((e) => (
                        <tr key={e.estadoTramite} className="border-b border-slate-50">
                          <td className="py-1 pr-2">{e.estadoTramite}</td>
                          <td className="py-1 text-right tabular-nums">{e.cantidad}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-slate-500 mt-3">
                    Ej.: <strong>CANCELADO = 223</strong> en RUAA vs{' '}
                    {analisis.porEstadoTramite.find((e) => e.estadoTramite === 'CANCELADO')?.cantidad ?? 0}{' '}
                    cuentas EPA con match cancelado.
                  </p>
                </div>
                <dl className="text-sm space-y-2 text-slate-700">
                  <div>
                    <dt className="text-slate-500">Códigos únicos (texto literal)</dt>
                    <dd className="font-medium">{snapshot.meta.ruaaResumen.codigosUnicosDistintos}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Códigos con más de una fila RUAA</dt>
                    <dd className="font-medium">
                      {snapshot.meta.ruaaResumen.codigosConMasDeUnaFila} (
                      {snapshot.meta.ruaaResumen.filasEnCodigosRepetidos} filas en total)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Cédulas/RUC con más de una fila</dt>
                    <dd className="font-medium">{snapshot.meta.ruaaResumen.cedulasConMasDeUnaFila}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-1">Recaudación anual estimada</h2>
            <p className="text-xs text-slate-500 mb-2 max-w-3xl">
              Brecha = cobro asumido EPA (cuentas Activo) menos el total conforme RUAA activo según el
              switch (confirmado o con ampliado).
            </p>
            {totalesRecaudacion && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Kpi
                  title="Cobro asumido EPA (Activo)"
                  value={fmtUsd(totalesRecaudacion.activo.montoCobradoAsumidoUsd)}
                  subtitle="Si EPA factura al caudal/tarifa inferidos"
                />
                <Kpi
                  title="Conforme RUAA (confirmado)"
                  value={fmtUsd(totalesRecaudacion.confirmado.montoDebeCobrarUsd)}
                  subtitle={`${totalesRecaudacion.confirmado.cuentasDebeCobrar} cuentas · código o cédula`}
                  active={!incluyeAmpliado}
                />
                <Kpi
                  title="Conforme RUAA (incl. ampliado)"
                  value={fmtUsd(totalesRecaudacion.ampliado.montoDebeCobrarUsd)}
                  subtitle={`${totalesRecaudacion.ampliado.cuentasDebeCobrar} cuentas · + estema / cédula norm.`}
                  active={incluyeAmpliado}
                />
                <Kpi
                  title="Brecha (sobre-recaudación neta)"
                  value={fmtUsd(totalesRecaudacion.activo.sobreRecaudacionUsd)}
                  subtitle={
                    incluyeAmpliado
                      ? 'Según total con cruce ampliado'
                      : 'Según total solo confirmado'
                  }
                  highlight
                />
              </div>
            )}
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
                  <option value="match_baja">Match baja confianza</option>
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
                    <th className="py-2 pr-2">Cruce</th>
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
                      <td className="py-2 pr-2 text-xs">
                        {f.matchMethod === 'none' ? (
                          '—'
                        ) : (
                          <span
                            title={f.matchMethod}
                            className={
                              f.matchConfianza === 'baja'
                                ? 'text-amber-700'
                                : f.matchConfianza === 'media'
                                  ? 'text-slate-600'
                                  : 'text-emerald-700'
                            }
                          >
                            {f.matchConfianza ?? 'alta'}
                          </span>
                        )}
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
  active,
}: {
  title: string;
  value: string;
  subtitle?: string;
  /** Brecha / alertas */
  highlight?: boolean;
  /** Total conforme RUAA usado por el switch */
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-lg shadow p-4 ${
        highlight
          ? 'bg-red-50 border border-red-100'
          : active
            ? 'bg-white border-2 border-emerald-500'
            : 'bg-white border border-transparent'
      }`}
    >
      <p className="text-xs text-slate-500 uppercase tracking-wide">{title}</p>
      <p className={`text-xl font-bold mt-1 ${highlight ? 'text-red-800' : ''}`}>{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-2 leading-snug">{subtitle}</p>}
    </div>
  );
}
