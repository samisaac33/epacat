import { jwtVerify } from 'jose';

const COMERCIAL_ROLES = new Set(['MANAGER', 'ADMIN']);

function authError(status: number, message: string, code: string) {
  return Response.json({ message, code }, { status });
}

async function validateViaUpstreamApi(authorization: string): Promise<boolean> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL;
  if (!apiUrl) return false;
  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, '')}/comercial/tarifas`, {
      headers: { Authorization: authorization },
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function verifyLocalJwt(token: string, secret: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const role = typeof payload.role === 'string' ? payload.role : '';
    return COMERCIAL_ROLES.has(role);
  } catch {
    return false;
  }
}

/** Devuelve una Response de error o null si el caller puede continuar. */
export async function assertComercialAccess(request: Request): Promise<Response | null> {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return authError(401, 'Inicie sesión de nuevo', 'NO_TOKEN');
  }
  const token = authorization.slice('Bearer '.length).trim();
  if (!token) {
    return authError(401, 'Inicie sesión de nuevo', 'NO_TOKEN');
  }

  const secret = process.env.JWT_SECRET;
  if (secret && (await verifyLocalJwt(token, secret))) {
    return null;
  }

  if (await validateViaUpstreamApi(authorization)) {
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  if (!secret && !(process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL)) {
    return authError(
      503,
      'Configure JWT_SECRET en el proyecto web (mismo valor que la API) o NEXT_PUBLIC_API_URL accesible para validar sesión.',
      'AUTH_NOT_CONFIGURED',
    );
  }

  return authError(
    401,
    'Sesión inválida o JWT_SECRET distinto entre web y API. Cierre sesión e inicie de nuevo.',
    'AUTH_MISMATCH',
  );
}
