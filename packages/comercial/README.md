# @epacat/comercial

Cruce de reportes EPA EP con RUAA (RPA) y estimación de recaudación por aprovechamiento de agua.

## Criterios de cruce

1. **Alta confianza:** `codigo_unico` normalizado (`MA-PO-...`, sin `/` ni sufijos `PENDIENTE`). Si hay varias filas RUAA con el mismo código, se elige la más cercana en caudal (±0,05 l/s) al `Caudal Fijo` EPA.
2. **Media confianza:** cédula/RUC literal + caudal (misma tolerancia y desempate).
3. **Baja confianza (cruce ampliado):** cédula/RUC normalizada (solo dígitos, sin ceros a la izquierda) + caudal; o **código estema** `MA-XX-######` común entre EPA (`PENDIENTE`) y RUAA (`codigo_proceso`).

Cada fila del análisis incluye `matchMethod` y `matchConfianza` (`alta` | `media` | `baja`).

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

Adjuntar solo el censo RUAA al snapshot existente:

```bash
npm run comercial:attach-ruaa-resumen -w @epacat/comercial -- /ruta/ruaa_total.csv
```
