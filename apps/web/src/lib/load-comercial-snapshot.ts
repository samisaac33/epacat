import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import type { AnalisisSnapshot } from '@epacat/comercial';

const nodeRequire = createRequire(import.meta.url);
const SNAPSHOT_NAME = 'analisis-manabi.snapshot.json';

function resolveSnapshotPath(): string {
  const candidates: string[] = [];
  try {
    const pkgJson = nodeRequire.resolve('@epacat/comercial/package.json');
    candidates.push(path.join(path.dirname(pkgJson), 'data', SNAPSHOT_NAME));
  } catch {
    /* ignore */
  }
  const cwd = process.cwd();
  candidates.push(
    path.join(cwd, 'data', SNAPSHOT_NAME),
    path.join(cwd, '../../packages/comercial/data', SNAPSHOT_NAME),
    path.join(cwd, 'node_modules', '@epacat/comercial', 'data', SNAPSHOT_NAME),
    path.join(cwd, '..', 'node_modules', '@epacat/comercial', 'data', SNAPSHOT_NAME),
    path.join(cwd, '..', '..', 'node_modules', '@epacat/comercial', 'data', SNAPSHOT_NAME),
  );
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    `Snapshot comercial no encontrado. Rutas probadas: ${candidates.join('; ')}`,
  );
}

export function loadComercialSnapshotForWeb(): AnalisisSnapshot {
  const filePath = resolveSnapshotPath();
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as AnalisisSnapshot;
}
