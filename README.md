# EPACAT — Sistema de catastro (Manabí, Ecuador)

Monorepo para el **Sistema EPACAT** de la Empresa Pública del Agua: catastro de usuarios y medidores con app móvil offline-first, dashboard web de validación y mapa GIS, y API middleware hacia legacy EPACOM (stub).

## Arquitectura

```
apps/api      → NestJS (sync, fotos, validación, GIS, EPACOM)
apps/web      → Next.js 15 (cola validación + mapa Leaflet)
apps/mobile   → Expo SDK 52 (SQLite offline + sync)
packages/shared    → Schemas Zod compartidos
packages/database  → Prisma + PostgreSQL/PostGIS
packages/epacom    → Adapter stub export EPACOM
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
npm run build --workspace=@epacat/epacom

# 5. Desarrollo (API + Web)
npm run dev
```

- **API:** http://localhost:3001 — Swagger: http://localhost:3001/api/docs
- **Web (portal ejecutivo dark):** http://localhost:3000 — dossier gerencial y acceso al sistema
- **Web (dashboard):** http://localhost:3000/login — validación, mapa y catastro
- **Mobile:** `npm run dev -w @epacat/mobile` (ajustar `EXPO_PUBLIC_API_URL` a la IP de tu máquina en red local)

## Usuarios de prueba (seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Técnico | tecnico1@epacat.gob.ec | epacat123 |
| Técnico | tecnico2@epacat.gob.ec | epacat123 |
| Gerente | gerente@epacat.gob.ec | epacat123 |
| Admin | admin@epacat.gob.ec | epacat123 |

## Flujo de prueba

1. Iniciar sesión en **móvil** como técnico → Nueva visita → capturar GPS, foto, lectura → Guardar offline.
2. Pestaña **Sincronizar** → subir fotos y enviar batch.
3. En **web** como gerente → Cola de validación → Aprobar visita.
4. Verificar archivo JSON en `storage/epacom-outbox/`.
5. **Mapa GIS** en web muestra puntos en Manabí.

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | API + Web en paralelo (Turbo) |
| `npm run build` | Build de todos los workspaces |
| `npm run docker:up` | Levantar PostGIS |
| `npm run db:migrate` | Aplicar migraciones |
| `npm run db:seed` | Datos de prueba Manabí |

## EPACOM (stub)

El paquete `@epacat/epacom` exporta visitas aprobadas como JSON en `storage/epacom-outbox/`. No hay conexión a BD externa legacy.
