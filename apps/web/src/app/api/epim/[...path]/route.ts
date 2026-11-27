import type { NextRequest } from 'next/server';
import { handleDemoEpim, proxyToUpstream } from '@/lib/demo-bff/handlers';

type Ctx = { params: Promise<{ path: string[] }> };

async function dispatch(method: string, req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const useUpstream = Boolean(process.env.EPIM_UPSTREAM_API_URL);

  if (useUpstream) {
    return proxyToUpstream(method, path, req);
  }

  const demo = await handleDemoEpim(method, path, req);
  if (demo) return demo;
  return Response.json({ message: `No implementado en demo: ${path.join('/')}` }, { status: 404 });
}

export function GET(req: NextRequest, ctx: Ctx) {
  return dispatch('GET', req, ctx);
}
export function POST(req: NextRequest, ctx: Ctx) {
  return dispatch('POST', req, ctx);
}
export function PATCH(req: NextRequest, ctx: Ctx) {
  return dispatch('PATCH', req, ctx);
}
export function PUT(req: NextRequest, ctx: Ctx) {
  return dispatch('PUT', req, ctx);
}