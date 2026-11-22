#!/usr/bin/env node
/**
 * Flujo OAuth único para guardar token.json (Scopes: presentaciones).
 * Coloca credentials.json (OAuth client tipo Desktop) en esta carpeta antes de ejecutar.
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = path.resolve(__dirname, 'credentials.json');
const TOKEN_PATH = path.resolve(__dirname, 'token.json');
const SCOPES = [
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/drive.file',
];

const PORT = 3333;

async function main() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('Coloca credentials.json en', __dirname);
    process.exit(1);
  }
  const keys = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = keys.installed ?? keys.web;
  const redirectUri = `http://127.0.0.1:${PORT}/oauth2callback`;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);
      if (url.pathname !== '/oauth2callback') return;
      const c = url.searchParams.get('code');
      if (!c) {
        res.end('Error: sin código');
        reject(new Error('No code'));
        return;
      }
      res.end('Autenticación OK. Puedes cerrar esta ventana.');
      server.close();
      resolve(c);
    });
    server.listen(PORT, () => {
      console.log('Abre en el navegador:\n', authUrl);
    });
  });

  const { tokens } = await oAuth2Client.getToken(code);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log('Token guardado en', TOKEN_PATH);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});