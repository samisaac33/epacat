# @epacat/comercial

Cruce de reportes EPA EP con RUAA (RPA) y estimación de recaudación por aprovechamiento de agua.

## Criterios de cruce

1. Join principal por `codigo_unico` normalizado (`MA-PO-...`, sin `/` ni sufijos `PENDIENTE`).
2. Si hay varias filas RUAA con el mismo código, se elige la más cercana en caudal (±0,05 l/s) al `Caudal Fijo` EPA.
3. Respaldo por cédula/RUC cuando no hay código.

## Fórmula de facturación anual (inferida de extractos de deuda EPA)

```
volumen_m3_año = caudal_l_s × 86_400 × 365 ÷ 1_000
monto_anual_usd = volumen_m3_año × tarifa_usd_m³
factura_centavos = round(monto_anual_usd × 100)
```

## Cobro

Autorizaciones con `estado_tramite` **VIGENTE** o **RENOVADO** en RUAA deben facturarse (usos sujetos a recaudación). El estado `Activo` del reporte EPA no sustituye al RUAA.

**Consumo humano** (JAAP, doméstico, etc.): tarifa **0** — no entra en recaudación EPA. Solo **excedente de consumo humano** usa tarifa 0,0039 US$/m³.

## Limitaciones

- Acuicultura usa tarifa **Otros** (0,0007 US$/m³) hasta confirmación normativa explícita.
- El reporte EPA tiene CSV irregular; revisar `parseWarnings` en el análisis.

## Snapshot para `/comercial`

El dashboard consume `data/analisis-manabi.snapshot.json` (no se suben CSV en producción), vía rutas BFF `GET /api/comercial/analisis` y `GET /api/comercial/tarifas` en la app Next (mismo origen en Vercel).

Regenerar cuando cambien los archivos fuente:

```bash
npm run comercial:snapshot -w @epacat/comercial -- /ruta/ruaa_total.csv /ruta/reporte_epa.csv
```

En Vercel, el build de `apps/web` copia el JSON a `apps/web/data/` (`scripts/copy-comercial-snapshot.mjs`); use `npm run build` del workspace web, no solo `next build`.

Variables alternativas: `RUAA_CSV`, `EPA_CSV`.
