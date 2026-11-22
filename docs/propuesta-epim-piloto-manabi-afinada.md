# Propuesta afinada — Piloto EPIM (Manabí, 30 días)

Documento narrativo para alinear el **deck de presentación** y la generación por **Google Slides API**. Fuente operativa de contratación: TDR HTML (9.950 USD + IVA).

---

## 1. Tesis en una frase

**EPIM es un piloto de servicios en la nube, exclusivo para Manabí, que cierra la brecha entre lo que ocurre en territorio (inspección georreferenciada) y lo que dicen RUAA y el extracto comercial EPA—sin sustituir el CRM/facturación nacional ya contratado.**

---

## 2. Posicionamiento (qué decir y qué no decir)

| Decir sí | Evitar |
|----------|--------|
| Complemento territorial y de **calidad de datos** | “Nuevo sistema de facturación” o “reemplazo del CRM” |
| **Piloto 30 días**, entregables medibles, ínfima cuantía | Proyecto multi-año o “implementación nacional” |
| **Conciliación RUAA–EPA** y tablero para decisiones de recaudación | Prometer integración productiva al core sin estar en el contrato |
| App **offline**, evidencia GPS/foto, validación en oficina | Hardware incluido o certificaciones ISO no contratadas |
| SaaS + soporte; propiedad de datos en la EPA | “Consultoría” como rubro principal |

---

## 3. Problema institucional (3 dolores)

1. **Territorio:** inspecciones en zonas con conectividad irregular; información que llega tarde o incompleta.
2. **Coherencia normativa–comercial:** cuentas activas en reportes EPA con trámites RUAA no alineados → riesgo de **sobre-/sub-recaudación** o decisiones sin evidencia.
3. **Visibilidad:** gerencia de cuenca no dispone de un **mapa y tablero único** del piloto para Manabí, paralelo al sistema corporativo.

---

## 4. Solución en el piloto (4 capacidades)

1. **Campo:** app móvil offline/online, brigadas, visitas con GPS y foto.
2. **Oficina:** cola de validación (aprobación o rechazo con trazabilidad).
3. **Territorio:** mapa GIS de visitas en Manabí.
4. **Analítica:** un corte RUAA + un corte EPA → reporte de cruce + tablero de solo lectura.

---

## 5. Oferta contractual (resumen ejecutivo)

| Concepto | Valor |
|----------|--------|
| Modalidad | Prestación de **servicios** (+ acceso SaaS); ínfima cuantía |
| Duración | **30 días calendario** (desde acta de inicio e insumos EPA) |
| Presupuesto referencial | **USD 9.950,00** + IVA 15% |
| Unidad requirente | Gerencia de Gestión de Cuenca y Recaudación (Manabí) |
| Pago | 100% contra acta de cierre e informe de conformidad |

---

## 6. Metas mínimas (compromiso verificable)

- 5 usuarios campo, 3 administración web.
- **80** visitas sincronizadas; ≥ 90% con GPS + foto.
- 100% visitas con decisión de validación.
- 1 reporte cruce RUAA–EPA (+ 1 actualización si aplica).
- 1 capacitación ≥ 4 h.

*(Detalle en anexo de entregables HTML.)*

---

## 7. Próximo paso después del piloto (sin comprometerlo en ínfima)

- Fase 2 bajo otro régimen: integración selectiva con sistema nacional, ampliación de cantones o convenio anual de SaaS.

Mensaje: el piloto **genera evidencia** para decidir ampliación; no es un ERP.

---

## 8. Audiencia y tono (acordado)

| Parámetro | Valor |
|-----------|--------|
| **Audiencia** | Gerencia de Gestión de Cuenca y Recaudación (Manabí) + técnicos / brigadas |
| **Énfasis** | Equilibrio: campo + validación + mapa + tablero RUAA–EPA |
| **Tono** | Operativo y decisorio; contratación solo como slide resumen |
| **Duración oral** | 15–20 minutos + demo opcional del tablero |

Mensaje rector para gerencia: *«En 30 días tendremos evidencia en territorio y un informe de brecha RUAA–EPA, sin tocar el sistema comercial nacional.»*

---

## 9. Mapeo a slides

Ver `docs/deck-epim-piloto-spec.json` — cada objeto `slides[]` alimenta la **Google Slides API** (`docs/scripts/generate-google-slides-deck.mjs`).