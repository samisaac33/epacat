import { createRequire } from 'node:module';

const nodeRequire = createRequire(import.meta.url);
const { CATALOGO_TARIFAS } = nodeRequire('@epacat/comercial') as {
  CATALOGO_TARIFAS: unknown;
};

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(CATALOGO_TARIFAS);
}
