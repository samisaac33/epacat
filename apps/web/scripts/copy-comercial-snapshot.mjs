import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const destDir = path.join(webRoot, 'data');
const dest = path.join(destDir, 'analisis-manabi.snapshot.json');

const sources = [
  path.join(webRoot, '../../packages/comercial/data/analisis-manabi.snapshot.json'),
  path.join(webRoot, 'node_modules/@epacat/comercial/data/analisis-manabi.snapshot.json'),
  path.join(webRoot, '../node_modules/@epacat/comercial/data/analisis-manabi.snapshot.json'),
  path.join(webRoot, '../../node_modules/@epacat/comercial/data/analisis-manabi.snapshot.json'),
];

for (const src of sources) {
  if (fs.existsSync(src)) {
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`[copy-comercial-snapshot] ${src} -> ${dest}`);
    process.exit(0);
  }
}

console.error('[copy-comercial-snapshot] No se encontró analisis-manabi.snapshot.json en:', sources);
process.exit(1);
