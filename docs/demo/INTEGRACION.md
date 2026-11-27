# Integración demo — Vercel + VM + móvil

## Orden de puesta en marcha

1. **VM:** seguir [DEPLOY-VM.md](./DEPLOY-VM.md) hasta `curl` OK en API pública.
2. **Seed:** `npm run docker:prod:seed` o `db:seed:demo` contra esa base.
3. **Vercel:** [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md) — `NEXT_PUBLIC_API_URL` + `JWT_SECRET` + redeploy.
4. **Móvil:** [DEMO-MOBILE.md](./DEMO-MOBILE.md) — `EXPO_PUBLIC_API_URL` igual que la API.
5. **Smoke:** [CHECKLIST-24H.md](./CHECKLIST-24H.md).

## Smoke sin VM (solo web)

**Modo Vercel (sin VM):** el BFF `/api/epim` habilita login, mapa y validación con datos demo.

- `https://epim-web.vercel.app/comercial` — tablero snapshot.
- `https://epim-web.vercel.app/login` → `/map` y `/validation`.

**Con VM:** configure `NEXT_PUBLIC_API_URL` o `EPIM_UPSTREAM_API_URL` y el mismo `JWT_SECRET`.

## Capturas de respaldo

Ver `docs/demo/screenshots/` (landing + comercial en Vercel, capturadas en QA).