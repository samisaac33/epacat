# Despliegue web demo en Vercel

Proyecto existente: **epacat-web** → alias [https://epim-web.vercel.app](https://epim-web.vercel.app).

## Variables de entorno (Production)

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://api.su-dominio.gob.ec` (API en su VM) |
| `JWT_SECRET` | **Idéntico** al de `.env.prod` en la VM |

Opcional:

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_EPA_CUENTA_BANCO` | Texto en simulador de recaudación |

Tras cambiar `NEXT_PUBLIC_*`, **redeploy** (nuevo build).

## Build

- **Root directory**: `apps/web` (según dashboard actual).
- **Install**: desde monorepo — `npm install --prefix=../..` o raíz del repo.
- **Build command**: `npm run build` en `apps/web` (incluye copia del snapshot comercial).

Referencia versionada: [`apps/web/vercel.json`](../apps/web/vercel.json).

## Rutas públicas sin API

- `/` landing
- `/comercial` y `/api/comercial/*` (snapshot Manabí)

Requieren API en VM: `/login`, `/validation`, `/map`, `/facturacion`, `/catastro`.

## Acceso para el funcionario (Deployment Protection)

Si el proyecto tiene **Vercel Authentication / SSO**:

1. **Opción A (recomendada para reunión):** desactivar protección en Production temporalmente, o
2. **Opción B:** Vercel → Project → Settings → Deployment Protection → **Protection Bypass for Automation** y compartir URL con `?x-vercel-protection-bypass=TOKEN`, o
3. **Opción C:** Share link de deployment sin protección.

Documentar el método elegido 24 h antes en [CHECKLIST-24H.md](./CHECKLIST-24H.md).

## CORS en la API (VM)

En `.env.prod` de la VM:

```
CORS_ORIGINS=https://epim-web.vercel.app,http://localhost:3000
```

Si usa preview deployments, añadir el hostname del preview.

## Verificación post-deploy

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://epim-web.vercel.app/comercial
curl -sS -o /dev/null -w "%{http_code}\n" https://epim-web.vercel.app/api/comercial/analisis
```

Login en UI debe llamar a `NEXT_PUBLIC_API_URL/auth/login` sin error CORS.