# Demo móvil — Expo Go contra API en producción

## Requisitos

- Smartphone Android o iOS con **Expo Go** instalado
- API pública HTTPS en la VM (`API_PUBLIC_URL`)
- Misma red o datos móviles con acceso al dominio del API (firewall 443 abierto)

## Configuración desarrollador (día de demo)

En la máquina donde corre el bundler Expo:

```bash
cd epacat
export EXPO_PUBLIC_API_URL=https://api.su-dominio.gob.ec
npm install
npm run dev -w @epacat/mobile
```

Escanear QR con Expo Go.

**Producción móvil sin cable:** publicar variables en `apps/mobile/.env` (no commitear):

```
EXPO_PUBLIC_API_URL=https://api.su-dominio.gob.ec
```

## Usuario técnico

- `tecnico1@epim.gob.ec` / `epim123`

## Flujo sugerido (5 min)

1. Login en la app.
2. **Visitas** → **Nueva visita**: GPS, lectura, foto (opcional).
3. Activar **modo avión** 30 s → guardar visita local.
4. Desactivar red → pestaña **Sincronizar** → **Sincronizar ahora**.
5. En laptop del funcionario: refrescar `/validation` y `/map`.

## CORS y subida de archivos

La app nativa no envía `Origin` como un navegador; `POST /sync/batches` y `POST /photos/upload` deben responder desde la API pública.

En demo, si hay bloqueos desde navegador web de Expo, use variable `CORS_ORIGINS=*` solo durante la reunión (ver [DEPLOY-VM.md](./DEPLOY-VM.md)).

## Errores frecuentes

| Síntoma | Causa |
|---------|--------|
| “No se puede conectar con la API…” | `EXPO_PUBLIC_API_URL` incorrecta o certificado TLS inválido |
| 401 al sincronizar | Sesión expirada — volver a login |
| Foto no se ve en web | `API_PUBLIC_URL` en la VM distinta del dominio que usa el móvil |