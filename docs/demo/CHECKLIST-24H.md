# Checklist 24 h antes de la demo

## VM (API + base de datos)

- [ ] `docker compose -f docker-compose.prod.yml ps` → `api` y `postgres` healthy
- [ ] `curl https://api.<dominio>/` → 200
- [ ] Certificado TLS válido (no expirado)
- [ ] Volumen `epim_uploads` con espacio libre
- [ ] `db:seed:demo` ejecutado (cola validación con pendientes)
- [ ] Backup `JWT_SECRET` y `.env.prod` en gestor seguro

## Vercel (web)

- [ ] `NEXT_PUBLIC_API_URL` apunta al API de la VM
- [ ] `JWT_SECRET` coincide con la VM
- [ ] Último deploy verde
- [ ] Acceso público confirmado (sin SSO bloqueando al funcionario)
- [ ] `/comercial` carga KPIs

## Funcional (smoke)

- [ ] Login gerente en `/login`
- [ ] `/validation` lista ≥ 5 pendientes
- [ ] `/map` muestra puntos Manabí
- [ ] Expo Go: login técnico + sync de prueba

## Materiales

- [ ] [GUION-FUNCIONARIO.md](./GUION-FUNCIONARIO.md) impreso o en tablet
- [ ] PDF pitch `docs/.pitch/epim-pitch-deck-manabi.pdf`
- [ ] Plan B: video/capturas en `docs/demo/screenshots/` si falla red móvil

## Día D

- [ ] WiFi de sala o hotspot para móvil
- [ ] Laptop con sesión gerente abierta
- [ ] Cerrar pestañas innecesarias; pantalla completa en `/comercial` para inicio