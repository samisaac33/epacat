import * as fs from 'fs';
import { buildRuaaResumen } from '../src/ruaa-resumen';
import { getSnapshotPath } from '../src/load-snapshot';
import type { AnalisisSnapshot } from '../src/types';

const ruaaPath = process.env.RUAA_CSV ?? process.argv[2];
if (!ruaaPath) {
  console.error('Uso: npm run comercial:attach-ruaa-resumen -- <ruaa_total.csv>');
  process.exit(1);
}

const snapPath = getSnapshotPath();
const snap = JSON.parse(fs.readFileSync(snapPath, 'utf8')) as AnalisisSnapshot;
const ruaaCsv = fs.readFileSync(ruaaPath, 'utf8');
snap.meta.ruaaResumen = buildRuaaResumen(ruaaCsv);
fs.writeFileSync(snapPath, JSON.stringify(snap, null, 2) + '\n', 'utf8');
console.log('ruaaResumen adjunto en', snapPath);
console.log('Total RUAA:', snap.meta.ruaaResumen.totalFilas);
console.log(
  'CANCELADO:',
  snap.meta.ruaaResumen.porEstadoTramite.find((e) => e.estadoTramite === 'CANCELADO')?.cantidad ?? 0,
);
