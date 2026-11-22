#!/usr/bin/env node
/**
 * Genera UNA slide de pitch (texto + diseño) con gemini-nano-banana-2.1
 *
 * Uso:
 *   node generate-pitch-slide.mjs --id 01-cover
 *   node generate-pitch-slide.mjs --id 01-cover --reference /path/ref.jpg
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPEC_PATH = path.resolve(__dirname, '../pitch-slides-spec.json');
const OUT_DIR = path.resolve(__dirname, '../pitch-slides');
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function parseArgs() {
  const args = process.argv.slice(2);
  let id = null;
  let reference = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--id' && args[i + 1]) id = args[++i];
    if (args[i] === '--reference' && args[i + 1]) reference = path.resolve(args[++i]);
  }
  return { id, reference };
}

function headlineToString(parts) {
  return parts.map((p) => p.text).join('').trim();
}

function buildPrompt(slide, brand) {
  const accentWords = slide.headline?.filter((p) => p.accent).map((p) => p.text.trim()) ?? [];
  const headlineFull = headlineToString(slide.headline ?? []);
  const bullets = slide.bullets?.map((b) => `• ${b}`).join('\n') ?? '';
  const visualSide = slide.visualSide === 'left' ? 'LEFT' : 'RIGHT';
  const textSide = visualSide === 'LEFT' ? 'RIGHT' : 'LEFT';

  return `Design a complete 16:9 PRESENTATION SLIDE (not a photo art piece). Copy the REGENTE: modern split-screen pitch deck like corporate/civic tech campaigns — ${textSide} panel ~50% solid navy ${brand.primary} with subtle gradient, ${visualSide} panel illustration or product mockup.

Typography: bold geometric sans-serif, large headline, small yellow-cyan label on top (use accent ${brand.accent} for highlighted words: ${accentWords.join(', ') || 'key phrase'}).

Render ALL of the following Spanish text LEGIBLY and EXACTLY on the text panel:
---
[Label, small caps accent color]
${slide.label ?? ''}

[Headline, large]
${headlineFull}

${slide.subtitle ? `[Subtitle]\n${slide.subtitle}\n` : ''}${bullets ? `[Bullets, white, accent dot bullets]\n${bullets}\n` : ''}[Footer small]
${slide.footer ?? brand.unit}
---

${slide.logoNote ? slide.logoNote + '. ' : ''}Entity: ${brand.entity}. NOT political campaign, no candidate faces, no election slogans, no purple — only EPA palette navy + cyan ${brand.accent}.

Visual panel: ${slide.visual}

No watermark, no lorem ipsum, crisp edges suitable for Google Slides PDF export.`;
}

async function generateSlide(model, parts, apiKey, aspectRatio) {
  const url = `${API_BASE}/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts }],
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
  if (!res.ok) throw new Error(data?.error?.message ?? JSON.stringify(data).slice(0, 400));
  const img = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!img) throw new Error('Sin imagen en respuesta');
  return Buffer.from(img.inlineData.data, 'base64');
}

async function main() {
  const { id, reference } = parseArgs();
  if (!id) {
    console.error('Indica --id 01-cover (ver pitch-slides-spec.json)');
    process.exit(1);
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Falta GEMINI_API_KEY');

  const spec = JSON.parse(fs.readFileSync(SPEC_PATH, 'utf8'));
  const slide = spec.slides.find((s) => s.id === id);
  if (!slide) throw new Error(`Slide ${id} no encontrada`);

  const model = process.env.GEMINI_IMAGE_MODEL ?? spec.model;
  const refPath =
    reference ??
    (spec.referenceStyleImage
      ? path.resolve(__dirname, spec.referenceStyleImage)
      : null);

  const logoPath = slide.useBrandLogo && spec.brand?.logoPath
    ? path.resolve(__dirname, spec.brand.logoPath)
    : null;

  const parts = [];
  if (refPath && fs.existsSync(refPath)) {
    const b64 = fs.readFileSync(refPath).toString('base64');
    parts.push({
      inlineData: { mimeType: 'image/jpeg', data: b64 },
    });
    parts.push({
      text: 'Reference STYLE ONLY (split layout, typography hierarchy, bullet style). Do not copy political content, colors, or people.',
    });
  }
  if (logoPath && fs.existsSync(logoPath)) {
    const logoB64 = fs.readFileSync(logoPath).toString('base64');
    parts.push({
      inlineData: { mimeType: 'image/jpeg', data: logoB64 },
    });
    parts.push({
      text:
        'OFFICIAL LOGO — reproduce this Empresa Pública del Agua emblem and wordmark EXACTLY (same three blue droplets + grey text). Do not invent alternate marks. Place top-right on the slide with margin; keep logo readable on white or very light band.',
    });
  }
  parts.push({ text: buildPrompt(slide, spec.brand) });

  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Generando ${id} con ${model}…`);
  const buffer = await generateSlide(model, parts, apiKey, spec.aspectRatio);
  const out = path.join(OUT_DIR, slide.file);
  fs.writeFileSync(out, buffer);
  console.log('Guardado:', out, `(${(buffer.length / 1024).toFixed(0)} KB)`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});