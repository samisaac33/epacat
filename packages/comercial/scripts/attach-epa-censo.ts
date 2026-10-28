import * as fs from 'fs';
import { buildCruceEstadisticas, buildEpaResumen } from '../src/epa-resumen';
import { buildRuaaResumen } from '../src/ruaa-resumen';
import { getSnapshotPath } from '../src/load-snapshot';
import type { AnalisisSnapshot } from '../src/types';

const epaPath = process.env.EPA_CSV ?? process.argv[2];
const ruaaPath = process.env.RUAA_CSV ?? process.argv[3];

if (!epaPath) {
  console.error('Uso: npm run comercial:attach-epa-censo -- <reporte_epa.csv> [ruaa_total.csv]');
  process.exit(1);
}

const snapPath = getSnapshotPath();
const snap = JSON.parse(fs.readFileSync(snapPath, 'utf8')) as AnalisisSnapshot;
const epaCsv = fs.readFileSync(epaPath, 'utf8');
snap.meta.epaResumen = buildEpaResumen(epaCsv);

if (ruaaPath) {
  const ruaaCsv = fs.readFileSync(ruaaPath, 'utf8');
  snap.meta.ruaaResumen = buildRuaaResumen(ruaaCsv);
  snap.meta.cruceEstadisticas = buildCruceEstadisticas(epaCsv, ruaaCsv);
}

fs.writeFileSync(snapPath, JSON.stringify(snap, null, 2) + '\n', 'utf8');
console.log('Censo EPA adjunto en', snapPath);
console.log(JSON.stringify(snap.meta.epaResumen, null, 2));
if (snap.meta.cruceEstadisticas) {
  console.log('Cruce:', JSON.stringify(snap.meta.cruceEstadisticas, null, 2));
}
