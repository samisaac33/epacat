import { SignJWT } from 'jose';
import type { NextRequest } from 'next/server';
import { DEMO_PUNTOS, DEMO_USERS } from './data';
import { getDecidedIds } from './state';

const JWT_SECRET = () =>
  new TextEncoder().encode(process.env.JWT_SECRET ?? 'epim-demo-jwt-secret-change-me');

function parseBbox(bbox: string | null): [number, number, number, number] | null {
  if (!bbox) return null;
  const nums = bbox.split(',').map(Number);
  if (nums.length !== 4 || nums.some(Number.isNaN)) return null;
  return nums as [number, number, number, number];
}

function inBbox(lng: number, lat: number, box: [number, number, number, number]) {
  const [minLng, minLat, maxLng, maxLat] = box;
  return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
}

export async function handleDemoEpim(
  method: string,
  path: string[],
  req: NextRequest,
): Promise<Response | null> {
  const route = path.join('/');

  if (method === 'POST' && route === 'auth/login') {
    const body = (await req.json()) as { email?: string; password?: string };
    const user = body.email ? DEMO_USERS[body.email] : undefined;
    if (!user || user.password !== body.password) {
      return Response.json({ message: 'Credenciales inválidas' }, { status: 401 });
    }
    const accessToken = await new SignJWT({
      sub: user.id,
      email: body.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET());
    return Response.json({
      accessToken,
      user: { id: user.id, email: body.email, nombre: user.nombre, role: user.role },
    });
  }

  if (method === 'GET' && route === 'gis/visitas') {
    const url = new URL(req.url);
    const bbox = parseBbox(url.searchParams.get('bbox'));
    const features = DEMO_PUNTOS.filter((p) => !bbox || inBbox(p.lng, p.lat, bbox)).map((p) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] as [number, number] },
      properties: {
        id: p.id,
        clientId: p.id,
        status: 'SYNCED',
        observaciones: p.observaciones,
        tecnicoNombre: p.tecnico,
        abonadoNombre: p.nombre,
        validacionStatus: p.validation,
      },
    }));
    return Response.json({ type: 'FeatureCollection', features });
  }

  if (method === 'GET' && route.startsWith('validation/queue')) {
    const decided = getDecidedIds();
    const pending = DEMO_PUNTOS.filter((p) => p.validation === 'PENDING' && !decided.has(p.id));
    const items = pending.map((p, i) => ({
      id: `val-${p.id}`,
      status: 'PENDING',
      comentario: null,
      createdAt: new Date(Date.UTC(2026, 10, 20 - i)).toISOString(),
      visita: {
        id: p.id,
        clientId: p.id,
        lat: p.lat,
        lng: p.lng,
        observaciones: p.observaciones,
        tecnico: { id: 't1', nombre: p.tecnico },
        abonado: { nombre: p.nombre, cedula: p.cedula, sector: p.sector },
        medidor: { numeroSerie: `DEMO-${p.cedula.slice(-4)}` },
        lecturas: [{ valor: 800 + i * 12, fecha: new Date().toISOString() }],
        fotos: [],
      },
    }));
    return Response.json({ items, total: items.length, page: 1, limit: 20 });
  }

  if (method === 'PATCH' && path[0] === 'validation' && path[1]) {
    const visitaId = path[1].replace(/^val-/, '');
    getDecidedIds().add(visitaId);
    return Response.json({ id: path[1], status: 'APPROVED', demo: true });
  }

  if (method === 'GET' && route === 'catastro/abonados') {
    return Response.json(
      DEMO_PUNTOS.map((p) => ({
        id: p.id,
        cedula: p.cedula,
        nombre: p.nombre,
        sector: p.sector,
        direccion: 'Manabí',
      })),
    );
  }

  if (method === 'GET' && route === 'billing/periodos/actual') {
    const now = new Date();
    return Response.json({
      id: 'demo-periodo',
      anio: now.getFullYear(),
      mes: now.getMonth() + 1,
      status: 'ABIERTO',
    });
  }

  if (method === 'GET' && route === 'billing/resumen') {
    return Response.json({
      periodo: { anio: new Date().getFullYear(), mes: new Date().getMonth() + 1 },
      facturasEmitidas: 0,
      facturasPagadas: 0,
      montoPendiente: 0,
    });
  }

  if (method === 'GET' && route.startsWith('billing/facturas')) {
    return Response.json({ items: [], total: 0, page: 1, limit: 20 });
  }

  if (method === 'POST' && route.startsWith('billing/')) {
    return Response.json({ demo: true, message: 'Facturación demo en Vercel BFF' });
  }

  if (method === 'POST' && route.startsWith('recaudacion/simular')) {
    return Response.json({ demo: true, message: 'Simulador demo Vercel' });
  }

  if (method === 'GET' && path.length === 0) {
    return Response.json({ status: 'ok', mode: 'demo-bff', service: 'EPIM' });
  }

  return null;
}

export async function proxyToUpstream(
  method: string,
  path: string[],
  req: NextRequest,
): Promise<Response> {
  const upstream = process.env.EPIM_UPSTREAM_API_URL?.replace(/\/$/, '');
  if (!upstream) {
    return Response.json({ message: 'Ruta no disponible en modo demo' }, { status: 404 });
  }
  const url = `${upstream}/${path.join('/')}${new URL(req.url).search}`;
  const headers = new Headers(req.headers);
  headers.delete('host');
  const body = method !== 'GET' && method !== 'HEAD' ? await req.text() : undefined;
  return fetch(url, { method, headers, body });
}