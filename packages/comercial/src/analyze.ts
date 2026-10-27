import { facturaAnualCentavos, montoAnualUsd } from './calcular-factura-anual';
import {
  indexRuaaByCedula,
  indexRuaaByCodigo,
  matchEpaToRuaa,
} from './match-records';
import { parseEpaReporteCsv } from './parse-epa-reporte';
import { parseRuaaCsv } from './parse-ruaa';
import { esEstadoTramiteCobrable } from './estados-cobrable';
import {
  aplicaRecaudacionPorEpa,
  aplicaRecaudacionPorUso,
  tarifaDesdeTipoFacturacionEpa,
  tarifaDesdeUsoRuaa,
} from './tarifas';
import type {
  AnalisisDistribucionCruce,
  AnalisisFila,
  AnalisisMontoRegla,
  AnalisisPorEstado,
  AnalisisResult,
  AnalisisResumen,
  EpaRow,
  TarifaOrigen,
} from './types';

function epaExcluido(epa: EpaRow): boolean {
  return epa.excluidoCatastro || epa.excluidoManual || epa.excluidoPeriodica;
}

function epaActivo(epa: EpaRow): boolean {
  return epa.estadoContrato.trim().toLowerCase() === 'activo';
}

function buildFila(epa: EpaRow, match: ReturnType<typeof matchEpaToRuaa>): AnalisisFila {
  const caudal = epa.caudalFijo || epa.caudalAplicable;
  const excluido = epaExcluido(epa);

  let tarifaUsdM3 = 0;
  let tarifaOrigen: TarifaOrigen = 'fallback_epa';
  let estadoTramite: string | null = null;
  let nomUso: string | null = null;
  let matchMethod = match?.method ?? ('none' as const);
  let aplicaRecaudacion = true;

  if (match) {
    estadoTramite = match.ruaa.estadoTramite;
    nomUso = match.ruaa.nomUsoAprovechamiento;
    aplicaRecaudacion = aplicaRecaudacionPorUso(
      match.ruaa.nomUsoAprovechamiento,
      match.ruaa.nomSubUso,
    );
    const fromUso = tarifaDesdeUsoRuaa(
      match.ruaa.nomUsoAprovechamiento,
      caudal,
      match.ruaa.nomSubUso,
    );
    tarifaUsdM3 = fromUso.tarifa;
    tarifaOrigen = fromUso.origen;
  } else {
    aplicaRecaudacion = aplicaRecaudacionPorEpa(epa.tipoContrato, epa.tipoFacturacion);
    const fromEpa = tarifaDesdeTipoFacturacionEpa(epa.tipoFacturacion, caudal, epa.tipoContrato);
    tarifaUsdM3 = fromEpa.tarifa;
    tarifaOrigen = fromEpa.origen;
    nomUso = epa.tipoContrato;
  }

  const centavos = facturaAnualCentavos(caudal, tarifaUsdM3);
  const montoTeoricoAnualUsd = centavos / 100;

  const debeCobrar =
    aplicaRecaudacion &&
    !excluido &&
    match != null &&
    esEstadoTramiteCobrable(match.ruaa.estadoTramite) &&
    caudal > 0 &&
    tarifaUsdM3 > 0;

  const activo = epaActivo(epa);
  const montoCobradoAsumidoUsd =
    activo && !excluido && caudal > 0 && aplicaRecaudacion ? montoTeoricoAnualUsd : 0;

  const montoCorrectoUsd = debeCobrar ? montoTeoricoAnualUsd : 0;
  const sobreRecaudacionUsd = montoCobradoAsumidoUsd - montoCorrectoUsd;

  return {
    cuentaUsuario: epa.cuentaUsuario,
    razonSocial: epa.razonSocial,
    identificacion: epa.identificacion,
    codigoUnico: epa.codigoUnico,
    codigoUnicoNorm: epa.codigoUnicoNorm,
    estadoContratoEpa: epa.estadoContrato,
    estadoTramiteRuaa: estadoTramite,
    matchMethod,
    nomUsoRuaa: nomUso,
    caudalFijoLs: caudal,
    tarifaUsdM3,
    tarifaOrigen,
    montoTeoricoAnualUsd,
    montoTeoricoAnualCentavos: centavos,
    debeCobrar,
    montoCobradoAsumidoUsd,
    sobreRecaudacionUsd,
    desalineacionEpaActivo:
      activo && estadoTramite != null && !esEstadoTramiteCobrable(estadoTramite),
    excluidoFacturacion: excluido,
  };
}

function aggregatePorEstado(filas: AnalisisFila[]): AnalisisPorEstado[] {
  const map = new Map<string, AnalisisPorEstado>();
  for (const f of filas) {
    if (!f.estadoTramiteRuaa) continue;
    const key = f.estadoTramiteRuaa;
    const esEstadoCobrable = esEstadoTramiteCobrable(f.estadoTramiteRuaa);
    const cur = map.get(key) ?? {
      estadoTramite: key,
      cantidad: 0,
      cantidadDebeCobrar: 0,
      montoDebeCobrarUsd: 0,
      montoCobradoAsumidoUsd: 0,
      montoTeoricoAnualUsd: 0,
      esEstadoCobrable,
    };
    cur.cantidad += 1;
    cur.montoTeoricoAnualUsd += f.montoTeoricoAnualUsd;
    cur.montoCobradoAsumidoUsd += f.montoCobradoAsumidoUsd;
    if (f.debeCobrar) {
      cur.cantidadDebeCobrar += 1;
      cur.montoDebeCobrarUsd += f.montoTeoricoAnualUsd;
    }
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => b.cantidad - a.cantidad);
}

function buildDistribucionCruce(filas: AnalisisFila[], filasSinCruce: number): AnalisisDistribucionCruce[] {
  const porEstado = aggregatePorEstado(filas);
  const rows: AnalisisDistribucionCruce[] = porEstado.map((e) => ({
    clave: e.estadoTramite,
    etiqueta: e.estadoTramite,
    cantidad: e.cantidad,
    esEstadoCobrable: e.esEstadoCobrable,
  }));
  if (filasSinCruce > 0) {
    rows.push({
      clave: 'SIN_CRUCE',
      etiqueta: 'Sin cruce RUAA',
      cantidad: filasSinCruce,
      esEstadoCobrable: false,
    });
  }
  return rows.sort((a, b) => b.cantidad - a.cantidad);
}

function buildMontosPorRegla(filas: AnalisisFila[]): AnalisisMontoRegla[] {
  const sinCruce = filas.filter((f) => f.matchMethod === 'none');
  const desalineacion = filas.filter((f) => f.desalineacionEpaActivo);
  const debeCobrar = filas.filter((f) => f.debeCobrar);
  const cobradoActivo = filas.filter((f) => f.montoCobradoAsumidoUsd > 0);

  const sum = (list: AnalisisFila[], pick: (f: AnalisisFila) => number) =>
    list.reduce((s, f) => s + pick(f), 0);

  return [
    {
      clave: 'ruaa_debe_cobrar',
      etiqueta: 'Recaudación conforme RUAA',
      descripcion: 'VIGENTE o RENOVADO, uso sujeto a recaudación, no excluido EPA',
      cantidad: debeCobrar.length,
      montoUsd: sum(debeCobrar, (f) => f.montoTeoricoAnualUsd),
    },
    {
      clave: 'epa_activo_asumido',
      etiqueta: 'Cobro asumido EPA (Activo)',
      descripcion: 'Si EPA factura a todas las cuentas Activo al caudal/tarifa inferidos',
      cantidad: cobradoActivo.length,
      montoUsd: sum(filas, (f) => f.montoCobradoAsumidoUsd),
    },
    {
      clave: 'brecha_sobre_recaudacion',
      etiqueta: 'Brecha (sobre-recaudación neta)',
      descripcion: 'Cobro asumido EPA menos lo que corresponde por RUAA cobrable',
      cantidad: filas.filter((f) => f.sobreRecaudacionUsd > 0.001).length,
      montoUsd: sum(filas, (f) => f.sobreRecaudacionUsd),
    },
    {
      clave: 'desalineacion_activo',
      etiqueta: 'Desalineación EPA Activo',
      descripcion: 'Activo en EPA con RUAA no VIGENTE/RENOVADO (cobro asumido)',
      cantidad: desalineacion.length,
      montoUsd: sum(desalineacion, (f) => f.montoCobradoAsumidoUsd),
    },
    {
      clave: 'sin_cruce',
      etiqueta: 'Sin cruce RUAA',
      descripcion: 'Cuentas EPA sin match; cobro asumido solo si Activo',
      cantidad: sinCruce.length,
      montoUsd: sum(sinCruce, (f) => f.montoCobradoAsumidoUsd),
    },
  ];
}

function buildResumen(filas: AnalisisFila[], sinCruce: AnalisisFila[], totalEpa: number): AnalisisResumen {
  const conCruce = filas.filter((f) => f.matchMethod !== 'none');
  return {
    totalFilasEpa: totalEpa,
    filasConCruce: conCruce.length,
    filasSinCruce: sinCruce.length,
    cuentasEpaActivas: filas.filter((f) => f.estadoContratoEpa.toLowerCase() === 'activo').length,
    desalineacionesEpaActivoNoVigente: filas.filter((f) => f.desalineacionEpaActivo).length,
    montoCobradoAsumidoTotalUsd: filas.reduce((s, f) => s + f.montoCobradoAsumidoUsd, 0),
    montoDebeCobrarTotalUsd: filas.reduce((s, f) => s + (f.debeCobrar ? f.montoTeoricoAnualUsd : 0), 0),
    sobreRecaudacionTotalUsd: filas.reduce((s, f) => s + f.sobreRecaudacionUsd, 0),
  };
}

export function analizarCruceRuaaEpa(ruaaCsv: string, epaCsv: string): AnalisisResult {
  const { rows: ruaaRows, warnings: wRuaa } = parseRuaaCsv(ruaaCsv);
  const { rows: epaRows, warnings: wEpa } = parseEpaReporteCsv(epaCsv);
  const parseWarnings = [...wRuaa, ...wEpa];

  const byCodigo = indexRuaaByCodigo(ruaaRows);
  const byCedula = indexRuaaByCedula(ruaaRows);

  const filas: AnalisisFila[] = [];
  const sinCruce: AnalisisFila[] = [];

  for (const epa of epaRows) {
    const match = matchEpaToRuaa(epa, byCodigo, byCedula);
    const fila = buildFila(epa, match);
    filas.push(fila);
    if (fila.matchMethod === 'none') sinCruce.push(fila);
  }

  const resumen = buildResumen(filas, sinCruce, epaRows.length);
  return {
    resumen,
    filas,
    sinCruce,
    porEstadoTramite: aggregatePorEstado(filas),
    distribucionCruce: buildDistribucionCruce(filas, resumen.filasSinCruce),
    montosPorRegla: buildMontosPorRegla(filas),
    parseWarnings,
  };
}

/** Recalcula agregados a partir de filas (p. ej. migrar snapshot sin reparsear CSV). */
export function recomputarAgregadosAnalisis(
  filas: AnalisisFila[],
  totalFilasEpa: number,
): Pick<
  AnalisisResult,
  'resumen' | 'sinCruce' | 'porEstadoTramite' | 'distribucionCruce' | 'montosPorRegla'
> {
  const sinCruce = filas.filter((f) => f.matchMethod === 'none');
  const resumen = buildResumen(filas, sinCruce, totalFilasEpa);
  return {
    resumen,
    sinCruce,
    porEstadoTramite: aggregatePorEstado(filas),
    distribucionCruce: buildDistribucionCruce(filas, resumen.filasSinCruce),
    montosPorRegla: buildMontosPorRegla(filas),
  };
}

/** Alias exportado para tests de fórmula sin CSV completos. */
export { montoAnualUsd, facturaAnualCentavos };
