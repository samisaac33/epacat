import * as fs from 'fs';
import * as path from 'path';
import { createRequire } from 'module';
import { SNAPSHOT_FILENAME, type AnalisisSnapshot } from './types';

const nodeRequire = createRequire(__filename);

export function getSnapshotPath(): string {
  const candidates: string[] = [
    path.join(__dirname, '..', 'data', SNAPSHOT_FILENAME),
  ];
  try {
    const pkgJson = nodeRequire.resolve('@epacat/comercial/package.json');
    candidates.push(path.join(path.dirname(pkgJson), 'data', SNAPSHOT_FILENAME));
  } catch {
    /* ignore */
  }
  const cwd = process.cwd();
  candidates.push(
    path.join(cwd, 'node_modules', '@epacat/comercial', 'data', SNAPSHOT_FILENAME),
  );
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0];
}

export function loadAnalisisSnapshot(): AnalisisSnapshot {
  const filePath = getSnapshotPath();
  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot comercial no encontrado: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as AnalisisSnapshot;
}
