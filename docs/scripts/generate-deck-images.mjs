#!/usr/bin/env node
/**
 * Genera imágenes 16:9 para el deck EPIM con Gemini Nano Banana 2.1
 * (model id: gemini-nano-banana-2.1)
 *
 * Requiere: GEMINI_API_KEY en entorno (p. ej. Vercel / agente cloud)
 *
 * Uso:
 *   node generate-deck-images.mjs
 *   node generate-deck-images.mjs --only cover,flow
 *   node generate-deck-images.mjs --dry-run
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPEC_PATH = path.resolve(__dirname, '../deck-slide-images.json');
const OUT_DIR = path.resolve(__dirname, '../deck-images');
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function parseArgs() {
  const args = process.argv.slice(2);
  let only = null;
  let dryRun = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--only' && args[i + 1]) {
      only = new Set(args[++i].split(',').map((s) => s.trim()));
    }
    if (args[i] === '--dry-run') dryRun = true;
  }
  return { only, dryRun };
}

async function generateOne(model, prompt, aspectRatio, apiKey) {
  const url = `${API_BASE}/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio },
    },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? JSON.stringify(data).slice(0, 500));
  }
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) throw new Error('Sin inlineData en respuesta');
  return { mimeType: img.inlineData.mimeType, buffer: Buffer.from(img.inlineData.data, 'base64') };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey && !parseArgs().dryRun) {
    throw new Error('Falta GEMINI_API_KEY');
  }

  const { only, dryRun } = parseArgs();
  const spec = JSON.parse(fs.readFileSync(SPEC_PATH, 'utf8'));
  const model = process.env.GEMINI_IMAGE_MODEL ?? spec.model ?? 'gemini-nano-banana-2.1';
  const aspectRatio = spec.aspectRatio ?? '16:9';
  const suffix = spec.styleSuffix ?? '';

  let slides = spec.slides;
  if (only) slides = slides.filter((s) => only.has(s.id));

  if (dryRun) {
    console.log(`Modelo: ${model} · ${slides.length} imágenes · salida: ${OUT_DIR}`);
    slides.forEach((s) => console.log(`- ${s.id}: ${s.filename}`));
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const manifest = {
    model,
    generatedAt: new Date().toISOString(),
    items: [],
  };

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const prompt = `${slide.prompt} ${suffix}`;
    const outPath = path.join(OUT_DIR, slide.filename);
    process.stdout.write(`[${i + 1}/${slides.length}] ${slide.id}… `);
    try {
      const { buffer } = await generateOne(model, prompt, aspectRatio, apiKey);
      fs.writeFileSync(outPath, buffer);
      manifest.items.push({ id: slide.id, file: `deck-images/${slide.filename}`, bytes: buffer.length });
      console.log(`OK (${(buffer.length / 1024).toFixed(0)} KB)`);
    } catch (e) {
      console.log('ERROR:', e.message);
      manifest.items.push({ id: slide.id, error: e.message });
    }
    if (i < slides.length - 1) await sleep(1500);
  }

  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('\nManifest:', path.join(OUT_DIR, 'manifest.json'));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});