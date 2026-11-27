#!/bin/sh
set -e
cd /app/packages/database
if [ "${RUN_MIGRATIONS_ON_START:-true}" = "true" ]; then
  npx prisma migrate deploy
fi
cd /app
exec node apps/api/dist/main.js