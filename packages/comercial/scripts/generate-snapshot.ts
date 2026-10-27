import * as fs from 'fs';
import * as path from 'path';
import { analizarCruceRuaaEpa } from '../src/analyze';
import { SNAPSHOT_FILENAME, type AnalisisSnapshot } from '../src/types';

function extractFechaReporteEpa(epaCsv: string): string | null {
  const m = epaCsv.match(/Fecha de Reporte:\s*(\d{2}\/\d{2}\/\d{4}[^,\n]*)/i);
  return m ? m[1].trim() : null;
}

function main() {
  const ruaaPath = process.env.RUAA_CSV ?? process.argv[2];
  const epaPath = process.env.EPA_CSV ?? process.argv[3];

  if (!ruaaPath || !epaPath) {
    console.error('Uso: RUAA_CSV=... EPA_CSV=... npm run comercial:snapshot');
    console.error('  o: npm run comercial:snapshot -- <ruaa.csv> <epa.csv>');
    process.exit(1);
  }

  const ruaaCsv = fs.readFileSync(path.resolve(ruaaPath), 'utf8');
  const epaCsv = fs.readFileSync(path.resolve(epaPath), 'utf8');
  const result = analizarCruceRuaaEpa(ruaaCsv, epaCsv);

  const snapshot: AnalisisSnapshot = {
    meta: {
      id: 'manabi-cruce-ruaa-epa',
      titulo: 'Cruce RUAA (RPA) vs reporte EPA EP — Manabí',
      descripcion:
        'Estudio puntual: estado de cobro según RUAA (VIGENTE o RENOVADO), facturación anual por caudal fijo y tarifa normativa (consumo humano excluido de recaudación); comparación con cuentas EPA en Activo.',
      generatedAt: new Date().toISOString(),
      criterioCobro: 'Autorizaciones con estado_tramite VIGENTE o RENOVADO en RUAA (usos sujetos a recaudación)',
      fuenteRuaa: 'Exportación RUAA / RPA — Ministerio del Ambiente y Agua',
      fuenteEpa: 'Reporte EPA EP: Cuentas, usuarios y punto de suministro',
      fechaReporteEpa: extractFechaReporteEpa(epaCsv),
    },
    result,
  };

  const outDir = path.join(__dirname, '..', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, SNAPSHOT_FILENAME);
  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2), 'utf8');

  console.log('Snapshot escrito:', outPath);
  console.log('Filas EPA:', result.resumen.totalFilasEpa);
  console.log('Cruce RUAA:', result.resumen.filasConCruce);
  console.log('Sobre-recaudación USD:', result.resumen.sobreRecaudacionTotalUsd.toFixed(2));
}

main();
