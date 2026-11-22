#!/usr/bin/env node
/**
 * Genera una presentación Google Slides desde docs/deck-epim-piloto-spec.json
 *
 * Requisitos:
 *   1. Proyecto en Google Cloud con Slides API + Drive API habilitadas
 *   2. Credenciales OAuth (pantalla de consentimiento) o cuenta de servicio con delegación
 *   3. npm install en docs/scripts
 *   4. GOOGLE_OAUTH_TOKEN_PATH apuntando a token.json (tras npm run auth:google)
 *
 * Uso:
 *   node generate-google-slides-deck.mjs
 *   node generate-google-slides-deck.mjs --spec ../deck-epim-piloto-spec.json --dry-run
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SPEC_DEFAULT = path.resolve(__dirname, '../deck-epim-piloto-spec.json');
const TOKEN_DEFAULT = path.resolve(__dirname, 'token.json');
const CREDS_DEFAULT = path.resolve(__dirname, 'credentials.json');

function parseArgs() {
  const args = process.argv.slice(2);
  let spec = SPEC_DEFAULT;
  let dryRun = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--spec' && args[i + 1]) spec = path.resolve(args[++i]);
    if (args[i] === '--dry-run') dryRun = true;
  }
  return { spec, dryRun };
}

function layoutToPredefined(layout) {
  const map = {
    TITLE: 'TITLE',
    TITLE_AND_BODY: 'TITLE_AND_BODY',
    TITLE_AND_TWO_COLUMNS: 'TITLE_AND_TWO_COLUMNS',
  };
  return map[layout] ?? 'TITLE_AND_BODY';
}

function collectInsertTextRequests(slideId, slideSpec, elementIds) {
  const requests = [];
  let idx = 0;

  const addTitle = (text) => {
    const id = `${slideId}_ph_${idx++}`;
    requests.push({
      insertText: { objectId: id, text, insertionIndex: 0 },
    });
    return id;
  };

  if (slideSpec.layout === 'TITLE') {
    elementIds.titleId && requests.push({
      insertText: { objectId: elementIds.titleId, text: slideSpec.title ?? '', insertionIndex: 0 },
    });
    if (slideSpec.subtitle && elementIds.subtitleId) {
      requests.push({
        insertText: { objectId: elementIds.subtitleId, text: slideSpec.subtitle, insertionIndex: 0 },
      });
    }
    return requests;
  }

  if (slideSpec.layout === 'TITLE_AND_TWO_COLUMNS') {
    elementIds.titleId && requests.push({
      insertText: { objectId: elementIds.titleId, text: slideSpec.title ?? '', insertionIndex: 0 },
    });
    const left = [slideSpec.leftTitle, ...(slideSpec.leftBullets ?? [])]
      .filter(Boolean)
      .join('\n');
    const right = [slideSpec.rightTitle, ...(slideSpec.rightBullets ?? [])]
      .filter(Boolean)
      .join('\n');
    if (elementIds.leftBodyId && left) {
      requests.push({ insertText: { objectId: elementIds.leftBodyId, text: left, insertionIndex: 0 } });
    }
    if (elementIds.rightBodyId && right) {
      requests.push({ insertText: { objectId: elementIds.rightBodyId, text: right, insertionIndex: 0 } });
    }
    return requests;
  }

  // TITLE_AND_BODY (default)
  elementIds.titleId && requests.push({
    insertText: { objectId: elementIds.titleId, text: slideSpec.title ?? '', insertionIndex: 0 },
  });
  const body =
    slideSpec.bullets?.map((b) => (b.match(/^\d+\./) ? b : `• ${b}`)).join('\n') ??
  slideSpec.body ??
    '';
  if (elementIds.bodyId && body) {
    requests.push({ insertText: { objectId: elementIds.bodyId, text: body, insertionIndex: 0 } });
  }
  void addTitle;
  return requests;
}

function placeholderMap(slide) {
  const map = {
    titleId: null,
    subtitleId: null,
    bodyId: null,
    leftBodyId: null,
    rightBodyId: null,
  };
  for (const el of slide.pageElements ?? []) {
    const ph = el.shape?.placeholder;
    if (!ph) continue;
    const type = ph.type;
    if (type === 'TITLE' || type === 'CENTERED_TITLE') map.titleId = el.objectId;
    else if (type === 'SUBTITLE') map.subtitleId = el.objectId;
    else if (type === 'BODY') {
      if (!map.bodyId) map.bodyId = el.objectId;
      else if (!map.leftBodyId) map.leftBodyId = el.objectId;
      else map.rightBodyId = el.objectId;
    }
    else if (type === 'SUBTITLE' || type === 'TITLE') {
      /* already handled */
    }
  }
  // TWO_COLUMNS: first BODY left, second BODY right
  const bodies = (slide.pageElements ?? [])
    .filter((el) => el.shape?.placeholder?.type === 'BODY')
    .map((el) => el.objectId);
  if (bodies.length >= 2) {
    map.leftBodyId = bodies[0];
    map.rightBodyId = bodies[1];
    map.bodyId = null;
  } else if (bodies.length === 1) {
    map.bodyId = bodies[0];
  }
  return map;
}

async function authorize() {
  const tokenPath = process.env.GOOGLE_OAUTH_TOKEN_PATH ?? TOKEN_DEFAULT;
  const credsPath = process.env.GOOGLE_OAUTH_CREDENTIALS_PATH ?? CREDS_DEFAULT;
  if (!fs.existsSync(credsPath)) {
    throw new Error(
      `Falta ${credsPath}. Descarga OAuth Client ID (Desktop) desde Google Cloud Console y guárdalo como credentials.json, luego: npm run auth:google`,
    );
  }
  if (!fs.existsSync(tokenPath)) {
    throw new Error(`Falta token en ${tokenPath}. Ejecuta: npm run auth:google`);
  }
  const credentials = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed ?? credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

async function main() {
  const { spec: specPath, dryRun } = parseArgs();
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

  if (dryRun) {
    console.log('Dry-run — diapositivas a generar:\n');
    spec.slides.forEach((s, i) => {
      console.log(`${i + 1}. [${s.layout}] ${s.title}`);
    });
    console.log(`\nTotal: ${spec.slides.length} slides · título presentación: ${spec.meta.title}`);
    return;
  }

  const auth = await authorize();
  const slidesApi = google.slides({ version: 'v1', auth });

  const createRes = await slidesApi.presentations.create({
    requestBody: { title: spec.meta.title },
  });
  const presentationId = createRes.data.presentationId;
  let presentation = createRes.data;

  const batch = [];
  const slideObjectIds = [];

  for (const slideSpec of spec.slides) {
    const slideId = `slide_${slideSpec.id}`.replace(/[^a-zA-Z0-9_]/g, '_');
    slideObjectIds.push({ slideId, slideSpec });
    batch.push({
      createSlide: {
        objectId: slideId,
        slideLayoutReference: {
          predefinedLayout: layoutToPredefined(slideSpec.layout),
        },
      },
    });
  }

  // Eliminar diapositiva en blanco inicial si existe más de una
  const initialSlideId = presentation.slides?.[0]?.objectId;
  if (initialSlideId && spec.slides.length > 0) {
    batch.push({ deleteObject: { objectId: initialSlideId } });
  }

  await slidesApi.presentations.batchUpdate({
    presentationId,
    requestBody: { requests: batch },
  });

  presentation = (
    await slidesApi.presentations.get({ presentationId })
  ).data;

  const slideById = new Map((presentation.slides ?? []).map((s) => [s.objectId, s]));

  const textBatch = [];
  for (const { slideId, slideSpec } of slideObjectIds) {
    const slide = slideById.get(slideId);
    if (!slide) {
      console.warn(`No se encontró slide ${slideId}`);
      continue;
    }
    const ph = placeholderMap(slide);
    textBatch.push(...collectInsertTextRequests(slideId, slideSpec, ph));

    if (slideSpec.speakerNotes) {
      const notesPage = slide.slideProperties?.notesPage;
      const notesShape = notesPage?.pageElements?.find(
        (el) => el.shape?.placeholder?.type === 'BODY' || el.shape?.placeholder?.type === 'SLIDE_IMAGE',
      );
      const notesBody = notesPage?.pageElements?.find(
        (el) => el.shape?.placeholder?.type === 'BODY',
      );
      const notesId = notesBody?.objectId ?? notesShape?.objectId;
      if (notesId) {
        textBatch.push({
          insertText: {
            objectId: notesId,
            text: slideSpec.speakerNotes,
            insertionIndex: 0,
          },
        });
      }
    }
  }

  if (textBatch.length > 0) {
    await slidesApi.presentations.batchUpdate({
      presentationId,
      requestBody: { requests: textBatch },
    });
  }

  const url = `https://docs.google.com/presentation/d/${presentationId}/edit`;
  console.log('Presentación creada:', url);
  console.log('Slides:', spec.slides.length);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});