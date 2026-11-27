# Integración demo — Vercel + VM + móvil

## Orden de puesta en marcha

1. **VM:** seguir [DEPLOY-VM.md](./DEPLOY-VM.md) hasta `curl` OK en API pública.
2. **Seed:** `npm run docker:prod:seed` o `db:seed:demo` contra esa base.
3. **Vercel:** [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md) — `NEXT_PUBLIC_API_URL` + `JWT_SECRET` + redeploy.
4. **Móvil:** [DEMO-MOBILE.md](./DEMO-MOBILE.md) — `EXPO_PUBLIC_API_URL` igual que la API.
5. **Smoke:** [CHECKLIST-24H.md](./CHECKLIST-24H.md).

## Smoke sin VM (solo web)

Mientras la API no esté pública:

- `https://epim-web.vercel.app/comercial` — tablero snapshot (funciona solo con Vercel).
- Login y módulos dashboard — requieren API VM.

## Capturas de respaldo

Ver `docs/demo/screenshots/` (landing + comercial en Vercel, capturadas en QA).