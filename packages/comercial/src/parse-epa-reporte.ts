import { parse } from 'csv-parse/sync';
import { normalizeCodigoUnico, parseNumeroLocale } from './normalize-codigo';
import type { EpaRow } from './types';

function trimHeader(h: string): string {
  return h.replace(/\s+/g, ' ').trim();
}

function isDataRow(firstCell: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T/.test(String(firstCell || '').trim());
}

function truthyExcluido(value: string | undefined): boolean {
  const v = (value ?? '').trim().toUpperCase();
  return v === 'X' || v === 'SI' || v === 'SÍ' || v === 'TRUE' || v === '1';
}

export function parseEpaReporteCsv(text: string): { rows: EpaRow[]; warnings: string[] } {
  const warnings: string[] = [];
  let records: string[][];
  try {
    records = parse(text.replace(/^\uFEFF/, ''), {
      relax_column_count: true,
      skip_empty_lines: true,
      relax_quotes: true,
    }) as string[][];
  } catch (e) {
    warnings.push(`EPA: error al parsear CSV (${e instanceof Error ? e.message : 'desconocido'})`);
    return { rows: [], warnings };
  }

  let headerRow: string[] | null = null;
  let headerIndex = -1;
  for (let i = 0; i < records.length; i++) {
    const joined = records[i].join(' ').toLowerCase();
    if (joined.includes('estado contrato') && joined.includes('código único')) {
      headerRow = records[i].map(trimHeader);
      headerIndex = i;
      break;
    }
    if (joined.includes('estado contrato') && joined.includes('codigo unico')) {
      headerRow = records[i].map(trimHeader);
      headerIndex = i;
      break;
    }
  }

  if (!headerRow) {
    warnings.push('EPA: no se encontró fila de encabezado');
    return { rows: [], warnings };
  }

  const col = (name: string) =>
    headerRow!.findIndex((h) => h.toLowerCase().includes(name.toLowerCase()));

  const iFecha = col('Fecha de Registro');
  const iCuenta = col('Cuenta de Usuario');
  const iTipoContrato = col('Tipo de contrato');
  const iId = col('Identificación');
  const iRazon = col('Razón Social');
  const iEstado = col('Estado Contrato');
  const iTipoFact = col('Tipo de Facturación');
  const iCodigo = col('Código Único');
  const iPlan = col('Planificación');
  const iCanton = col('Canton en registrada en el contrato');
  const iCaudalApl = col('Caudal Aplicable');
  const iCaudalFijo = col('Caudal Fijo');
  const iExCat = col('Excluido de facturación por Catastro');
  const iExMan = col('Excluido de facturación Manual');
  const iExPer = col('Excluido de facturación Periódica');

  const get = (row: string[], index: number) => (index >= 0 ? (row[index] ?? '').trim() : '');

  const rows: EpaRow[] = [];
  for (let i = headerIndex + 1; i < records.length; i++) {
    const row = records[i];
    if (!isDataRow(get(row, iFecha))) continue;

    const codigoRaw = get(row, iCodigo);
    const codigoNorm = normalizeCodigoUnico(codigoRaw);

    rows.push({
      fechaRegistro: get(row, iFecha),
      cuentaUsuario: get(row, iCuenta),
      tipoContrato: get(row, iTipoContrato),
      identificacion: get(row, iId),
      razonSocial: get(row, iRazon),
      estadoContrato: get(row, iEstado),
      tipoFacturacion: get(row, iTipoFact),
      codigoUnico: codigoRaw,
      codigoUnicoNorm: codigoNorm ?? '',
      planificacion: get(row, iPlan),
      cantonContrato: get(row, iCanton),
      caudalAplicable: parseNumeroLocale(get(row, iCaudalApl)),
      caudalFijo: parseNumeroLocale(get(row, iCaudalFijo)),
      excluidoCatastro: truthyExcluido(get(row, iExCat)),
      excluidoManual: truthyExcluido(get(row, iExMan)),
      excluidoPeriodica: truthyExcluido(get(row, iExPer)),
    });
  }

  if (rows.length === 0) {
    warnings.push('EPA: no se encontraron filas de datos');
  }

  return { rows, warnings };
}
