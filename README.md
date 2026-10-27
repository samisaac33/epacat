# EPIM — Inteligencia de medición (Manabí, Ecuador)

Monorepo del **sistema EPIM** (Empresa Pública del Agua, Manabí — Inteligencia de Medición): catastro de usuarios y medidores con app móvil offline-first, dashboard web de validación, mapa GIS, facturación por periodos y recaudación vía **Banco Pacífico**.

> El repositorio y los paquetes npm conservan el prefijo técnico `epacat` / `@epacat/*` (nombre del proyecto de desarrollo). La marca operativa y de interfaz es **EPIM**.

## Arquitectura

```
apps/api           → NestJS (sync, validación, GIS, facturación, recaudación, Resend)
apps/web           → Next.js 15 (validación, facturación, simulador bancario, mapa)
apps/mobile        → Expo SDK 52 (SQLite offline + sync)
packages/shared    → Schemas Zod compartidos
packages/database  → Prisma + PostgreSQL/PostGIS
packages/pacifico  → Cliente stub del convenio Banco Pacífico
```

## Requisitos

- Node.js 20+
- Docker Desktop (PostgreSQL + PostGIS)
- Expo Go (para app móvil)

## Arranque rápido

```bash
# 1. Dependencias
npm install

# 2. Variables de entorno
cp .env.example .env
cp apps/api/.env.example apps/api/.env

# 3. Base de datos
npm run docker:up
npm run db:generate
npm run db:migrate
npm run db:seed

# 4. Compilar paquetes compartidos
npm run build --workspace=@epacat/shared
npm run build --workspace=@epacat/database
npm run build --workspace=@epacat/pacifico

# 5. Desarrollo (API + Web)
npm run dev
```

- **API:** http://localhost:3001 — Swagger: http://localhost:3001/api/docs
- **Web (portal ejecutivo dark):** http://localhost:3000 — portal EPIM y acceso al sistema
- **Web (dashboard):** http://localhost:3000/login — validación, facturación, mapa y catastro
- **Simulador bancario:** http://localhost:3000/facturacion/simulador
- **Mobile:** `npm run dev -w @epacat/mobile` (ajustar `EXPO_PUBLIC_API_URL` a la IP de tu máquina en red local)

## Usuarios de prueba (seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Técnico | tecnico1@epim.gob.ec | epim123 |
| Técnico | tecnico2@epim.gob.ec | epim123 |
| Gerente | gerente@epim.gob.ec | epim123 |
| Admin | admin@epim.gob.ec | epim123 |

Abonado seed: cédula `1301234567`, email `juan.perez@example.com`.

## Flujo de prueba

1. Iniciar sesión en **móvil** como técnico → Nueva visita → capturar GPS, foto, lectura, email → Guardar offline.
2. Pestaña **Sincronizar** → subir fotos y enviar batch.
3. En **web** como gerente → Cola de validación → Aprobar visita.
4. Ir a **Facturación** → Cerrar periodo → facturas emitidas + correo stub si hay email.
5. **Simulador Banco Pacífico** → consultar deuda por cédula → simular pago ventanilla/banca web.
6. Verificar factura **PAGADA** y comprobante registrado en logs de cobranza.

## Recaudación Banco Pacífico (API)

Contrato para el banco (header `X-Banco-Api-Key`):

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/recaudacion/v1/consulta?identificacion=` | Deuda pendiente por cédula o RUC |
| POST | `/recaudacion/v1/pago` | Notificación de pago (idempotente) |
| POST | `/recaudacion/v1/reverso` | Reverso bancario |

Variables: `BANCO_PACIFICO_API_KEY`, `EPA_CUENTA_BANCO`.

El paquete `@epacat/pacifico` incluye un cliente stub para pruebas de integración.

## Correos de cobranza (Resend)

- **Factura emitida** — al cerrar periodo
- **Comprobante de pago** — al confirmar pago bancario
- **Recordatorios** — cron diario (facturas por vencer o vencidas)

Sin `RESEND_API_KEY` el sistema opera en modo stub (registra en `CobranzaEmail` y log en consola).

## Despliegue web (Vercel)

Variables recomendadas en el proyecto **web** (`apps/web`):

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_API_URL` | URL HTTPS de la API Nest (validación, facturación, login). Obligatoria si la API está en otro host. |
| `JWT_SECRET` | Mismo valor que en la API. Permite servir `/api/comercial/*` (snapshot RUAA/EPA) en el mismo dominio que la web, sin depender de CORS. |

En la **API**, incluir el origen de la web en `CORS_ORIGINS`, por ejemplo `https://epim-web.vercel.app,http://localhost:3000`.

Tras cambiar `NEXT_PUBLIC_*`, redeployar la web (se inlined en el build).

**Checklist `/comercial` en producción (solo web Vercel)**

1. `/comercial` y `/api/comercial/*` son **públicos** (snapshot de estudio, sin login).
2. El resto del dashboard (validación, facturación, etc.) sigue pidiendo sesión vía API Nest (`NEXT_PUBLIC_API_URL` + login).
3. **Build command** en Vercel: `npm run build` desde `apps/web` (o monorepo con filtro `@epacat/web`), no solo `next build` — copia el snapshot a `apps/web/data/` para la función serverless.

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | API + Web en paralelo (Turbo) |
| `npm run build` | Build de todos los workspaces |
| `npm run docker:up` | Levantar PostGIS |
| `npm run db:migrate` | Aplicar migraciones |
| `npm run db:seed` | Datos de prueba Manabí |
