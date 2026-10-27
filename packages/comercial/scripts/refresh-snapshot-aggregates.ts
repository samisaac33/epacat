/**
 * Recalcula resumen / porEstadoTramite / distribucionCruce / montosPorRegla
 * en el snapshot existente (sin CSV fuente).
 */
import * as fs from 'fs';
import { recomputarAgregadosAnalisis } from '../src/analyze';
import { getSnapshotPath } from '../src/load-snapshot';
import type { AnalisisSnapshot } from '../src/types';

const path = getSnapshotPath();
const snap = JSON.parse(fs.readFileSync(path, 'utf8')) as AnalisisSnapshot;
const total = snap.result.resumen?.totalFilasEpa ?? snap.result.filas.length;
const agg = recomputarAgregadosAnalisis(snap.result.filas, total);
snap.result = { ...snap.result, ...agg };
fs.writeFileSync(path, JSON.stringify(snap, null, 2) + '\n', 'utf8');
console.log('Snapshot actualizado:', path);
