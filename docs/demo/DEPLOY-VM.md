# Despliegue demo EPIM en VM (API + PostGIS)

La web pública corre en **Vercel** ([epim-web.vercel.app](https://epim-web.vercel.app)). Esta VM aloja **Nest API**, **PostgreSQL/PostGIS** y **fotos** (`/data/uploads`).

## Requisitos VM

- Ubuntu 22.04+ (o similar), 2 vCPU, 4 GB RAM mínimo para demo
- Docker Engine + plugin Compose v2
- Dominio `api.su-dominio.gob.ec` → IP de la VM (registro A)
- Puertos: **443** público (Caddy/Nginx); **5432 no** expuesto

## Pasos

1. Clonar el repositorio y checkout de rama demo:

```bash
git clone https://github.com/samisaac33/epacat.git
cd epacat
git checkout cursor/demo-produccion-epim-99d5
```

2. Variables de entorno:

```bash
cp deploy/.env.prod.example .env.prod
nano .env.prod   # POSTGRES_PASSWORD, JWT_SECRET, API_PUBLIC_URL, CORS_ORIGINS
```

3. Levantar stack:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

4. Sembrar datos base + demo Manabí:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml --profile tools run --rm seed
```

Equivalente local (con Postgres ya arriba):

```bash
npm ci && npm run db:generate
npm run db:seed && npm run db:seed:demo
```

5. TLS delante del API (elige uno):

- **Caddy**: copiar [`deploy/caddy.example.Caddyfile`](../../deploy/caddy.example.Caddyfile), `caddy run`
- **Nginx**: [`deploy/nginx.example.conf`](../../deploy/nginx.example.conf) + certbot

6. Comprobar desde fuera:

```bash
curl -sS https://api.su-dominio.gob.ec/
curl -sS -o /dev/null -w "%{http_code}\n" https://api.su-dominio.gob.ec/api/docs
```

7. Configurar Vercel con la misma `JWT_SECRET` y `NEXT_PUBLIC_API_URL=https://api.su-dominio.gob.ec` — ver [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md).

## Operación

| Acción | Comando |
|--------|---------|
| Logs API | `docker compose -f docker-compose.prod.yml logs -f api` |
| Reinicio | `docker compose -f docker-compose.prod.yml restart api` |
| Backup volumen DB | `docker run --rm -v epacat_epim_pgdata:/v -v $(pwd):/b alpine tar czf /b/pg-backup.tgz -C /v .` |

## Firewall sugerido

- Permitir: 22 (SSH restringido), 80/443
- Denegar: 5432, 3001 desde Internet (3001 solo loopback; proxy en 443)