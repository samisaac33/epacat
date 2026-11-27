# Especificaciones técnicas — Prestación de servicio EPIM (Manabí)

**Documento tipo:** especificaciones técnicas / términos de referencia de **servicio** (y, de ser pertinente, **bien** intangible en licencia), para contratación por **ínfima cuantía**.

**Entidad contratante:** Empresa Pública del Agua — Manabí (EPA Manabí / EPA EP), unidad requirente: **Gerencia de Gestión de Cuenca y Recaudación (Manabí)**.

**Versión vigente del presupuesto / TDR:** [`presupuesto-referencial-epim-infima-cuantia-manabi.html`](presupuesto-referencial-epim-infima-cuantia-manabi.html) — piloto **30 días calendario**, subtotal USD 9.950,00. Este Markdown es anexo de especificaciones; si hay divergencia de plazo o ítems, prevalece el HTML aprobado por la entidad.

**Presupuesto referencial máximo:** USD 10.000,00 (diez mil dólares de los Estados Unidos de América), **más IVA** si aplica. El proveedor cotizará en proforma sin superar dicho valor referencial.

**Vigencia de uso:** borrador para la unidad requirente. Debe ser revisado por la unidad de compras pública y la asesoría jurídica de la entidad antes de publicar el aviso en el portal del SERCOP.

---

## 1. Antecedentes y justificación

1.1. La EPA Manabí opera el servicio público de agua en un territorio con cobertura urbana y rural, con sectores de conectividad limitada.

1.2. La entidad dispone o está incorporando un **sistema nacional** de gestión comercial (CRM, facturación y procesos asociados), contratado e implementado a nivel corporativo. Dicho sistema es el **sistema maestro** para el ciclo comercial estándar.

1.3. Persisten necesidades **específicas del ámbito Manabí** que no deben confundirse con la sustitución del sistema nacional:

- Registro de **medición y catastro en campo** con evidencia (ubicación, fotografía, lectura) en condiciones **offline**.
- **Revisión y validación** en oficina antes de incorporar datos al proceso institucional.
- **Visualización territorial** (mapa) del avance de visitas y cobertura.
- **Análisis de consistencia** entre autorizaciones de aprovechamiento (RUAA/RPA) y cuentas del extracto EPA EP, orientado a recaudación por aprovechamiento de agua y control de desalineaciones.

1.4. El presente requerimiento contrata la **prestación de un servicio tecnológico piloto**, complementario al sistema nacional, con entregables medibles y plazo acotado, dentro del umbral de ínfima cuantía autorizado por la entidad.

---

## 2. Objeto contractual

Contratar la **prestación del servicio** de implementación, operación piloto y soporte de la plataforma **EPIM** (*Inteligencia de Medición*), exclusiva para la **jurisdicción Manabí**, orientada al **fortalecimiento de la recaudación por aprovechamiento** y la **identificación y priorización de usuarios a regularizar** (cruce RUAA–extracto EPA, evidencia en campo), incluyendo —de forma opcional en la proforma— **acceso SaaS** durante el piloto.

**En ningún caso** el objeto incluye: sustitución del CRM nacional, facturación masiva de consumo doméstico en producción, ni integración productiva obligatoria con el core nacional (ello podrá tratarse en procesos posteriores, si la institución lo define).

---

## 3. Definiciones

| Término | Definición |
|--------|------------|
| **EPA EP / EPA Manabí** | Empresa Pública del Agua, ámbito Manabí. |
| **EPIM** | Plataforma de inteligencia de medición: app móvil, portal web, API y módulos de análisis territorial. |
| **Piloto** | Operación acotada en tiempo, usuarios y volumen de visitas, sin carácter de sistema único de facturación nacional. |
| **Entregable** | Producto o resultado verificable (informe, tablero, acceso, capacitación certificada, etc.) descrito en la sección 6. |
| **RUAA / RPA** | Registro de usuarios y autorizaciones de aprovechamiento de agua (fuente institucional). |
| **Extracto EPA EP** | Reporte institucional de cuentas, usuarios y puntos de suministro. |

---

## 4. Alcance del servicio

El contratista prestará los siguientes **servicios**, como mínimo:

### 4.1. Servicio de habilitación e implementación

- Despliegue de la plataforma EPIM en entorno acordado (instalación en infraestructura de la entidad y/o hosting piloto indicado en la proforma).
- Configuración inicial: roles (técnico de campo, administración, administrador del sistema), parámetros de Manabí y credenciales para personal designado por la EPA.
- Entrega de manual de operación básica (digital) para uso en piloto.

### 4.2. Servicio de operación piloto — medición en campo y validación

- Habilitación de la **aplicación móvil** para registro de visitas: abonado/medidor, lectura, coordenadas GPS, fotografía, almacenamiento **sin conexión** y sincronización cuando exista red.
- Habilitación del **portal web** de validación: cola de visitas, aprobación o rechazo con comentario, consulta de abonados y medidores en el alcance del piloto.
- Habilitación del **mapa territorial** (visualización de visitas georreferenciadas en Manabí).
- Límites del piloto (mínimos exigibles; el proveedor podrá ofertar superiores sin aumentar el precio referencial):

  | Parámetro | Mínimo institucional |
  |-----------|----------------------|
  | Plazo del piloto | 90 días calendario desde inicio |
  | Usuarios técnicos de campo | 5 |
  | Usuarios de administración | 3 |
  | Visitas sincronizadas exitosamente | 200 |
  | Jornadas de acompañamiento remoto | 4 (post puesta en marcha) |

### 4.3. Servicio de procesamiento de datos y reportes (área aprovechamiento / comercial)

- Carga y procesamiento, bajo instrucción de la entidad, de **un (1) corte** de extracto EPA EP y **un (1) corte** de archivo RUAA Manabí (formatos provistos por la EPA).
- Generación de **reporte tabular y gráfico** de cruce RUAA–EPA: matches por confianza, brechas de cobro asumido vs debido, desalineaciones (cuenta Activa en EPA con trámite RUAA no cobrable), resumen estadístico.
- Puesta a disposición de **tablero web de solo lectura** para personal autorizado de la EPA durante el piloto (acceso vía navegador).
- **Una (1) actualización** del reporte si la entidad entrega archivos corregidos dentro de los primeros 45 días del piloto.

### 4.4. Servicio de capacitación

- **Una (1) jornada presencial o virtual** (mínimo 4 horas) para técnicos de campo y administración: uso de app, sincronización, validación, consulta de mapa y tablero comercial.
- Lista de asistencia y material entregado (PDF o equivalente).

### 4.5. Servicio de soporte

- Soporte durante el piloto por canal definido (correo y/o ticketing): tiempo de respuesta máximo **48 horas hábiles** para incidentes que impidan operar; **5 días hábiles** para requerimientos menores.
- Corrección de defectos del software **dentro del alcance** del piloto, sin costo adicional.

### 4.6. Bien opcional (licencia)

El proveedor podrá incluir en la proforma, separado del servicio:

- **Licencia de uso no exclusiva** del software EPIM **únicamente** por la duración del piloto y para la EPA Manabí.

La suma de **servicio + licencia** no excederá el presupuesto referencial de la sección superior.

---

## 5. Exclusiones explícitas

No forman parte del objeto:

1. Desarrollo a medida de facturación equivalente al sistema nacional o migración masiva de históricos comerciales.
2. Integración **productiva** bidireccional con CRM/facturación nacional (solo se admite documentación de recomendaciones de interoperabilidad como anexo informativo, sin obligación de APIs en producción).
3. Hardware (celulares, tablets, servidores físicos); la EPA proveerá dispositivos y conectividad para técnicos, salvo que la proforma indique explícitamente un bien adicional acordado.
4. Conectividad, energía y acceso a datos en sitios de campo.
5. Certificaciones de seguridad oficiales (ISO, etc.) no exigidas en este piloto.
6. Soporte o licencia **posterior** al plazo del piloto (podrá contratarse en otro proceso).

---

## 6. Entregables y criterios de aceptación

| N.º | Entregable | Criterio de aceptación |
|-----|------------|------------------------|
| E1 | Acta de inicio (día 1–5) | Firmada por responsable designado EPA + proveedor; cronograma y matriz de accesos. |
| E2 | Plataforma EPIM operativa | Login web y app operativos; al menos una visita de prueba de extremo a extremo (campo → sync → validación → mapa). |
| E3 | Reporte de cruce RUAA–EPA | Documento digital con metodología, totales, tablas de brecha y desalineaciones; coherente con datos de entrada. |
| E4 | Acceso al tablero comercial | URL o ruta institucional acordada; visualización sin intervención del proveedor. |
| E5 | Capacitación E4.4 | Acta de asistencia + material; encuesta simple de satisfacción ≥ 70% “satisfecho o muy satisfecho” entre asistentes. |
| E6 | Manual de operación piloto | PDF con pasos de uso para roles definidos. |
| E7 | Acta de cierre (última semana del piloto) | Resumen de visitas, incidencias resueltas, estado de entregables; conformidad o observaciones fundadas de la EPA. |

La EPA dispondrá de **10 días hábiles** para aceptar o formular observaciones técnicas fundadas por entregable. El proveedor atenderá observaciones **objetivas** dentro del alcance en **15 días hábiles** (una ronda).

---

## 7. Requisitos técnicos mínimos del servicio

7.1. **Aplicación móvil:** compatible con versiones recientes de Android soportadas por la entidad; registro offline de visitas; sincronización segura con el servidor.

7.2. **Portal web:** acceso vía HTTPS; roles diferenciados; cola de validación; vista de mapa sobre territorio Manabí.

7.3. **Respaldo de evidencias:** fotografías y metadatos de visita asociados al registro validado (conservación durante el piloto en el entorno contratado).

7.4. **Análisis RUAA–EPA:** motor de cruce documentado (códigos únicos, cédula/RUC y caudal, según reglas publicadas en la documentación técnica del proveedor); salida exportable (CSV o PDF del reporte).

7.5. **Seguridad mínima:** autenticación por usuario y contraseña; comunicaciones cifradas (TLS); no compartir credenciales de la EPA con terceros.

7.6. **Propiedad y datos:** los datos cargados por la EPA son de propiedad de la entidad. Al cierre, el proveedor entrega exportación de datos del piloto en formato estándar (CSV/JSON/SQL según acuerdo) y elimina copias en su hosting piloto, salvo obligación legal de conservación.

---

## 8. Obligaciones de la entidad contratante

- Designar **un responsable del servicio** y **un responsable técnico** con poder de decisión para actas y aceptación.
- Proveer extractos RUAA y EPA EP en el formato disponible y autorizar personal para capacitación.
- Facilitar conectividad y dispositivos móviles para técnicos, en la medida de su operación.

---

## 9. Obligaciones del contratista

- Ejecutar el servicio con personal idóneo en sistemas de información o gestión de recursos hídricos.
- Mantener confidencialidad de datos institucionales.
- No usar datos de la EPA con fines comerciales ni de mercadeo a terceros.
- Cumplir plazos de entregables sin fraccionar el objeto para evadir topes legales (responsabilidad del contratista respecto de sus declaraciones en proforma).

---

## 10. Plazo de ejecución

**Máximo 105 días calendario** desde la notificación de inicio de ejecución de la orden de compra:

- Días 1–15: habilitación e implementación (E1, E2 parcial).
- Días 16–90: operación piloto (E2 completo, E3, E4, E4.4, soporte).
- Días 91–105: cierre, exportación de datos y acta final (E7).

---

## 11. Modalidad y lugar de prestación

- Implementación y soporte: **remota**, con visitas presenciales **solo si el proveedor las ofrece incluidas** en su proforma (no obligatorias para la entidad).
- Capacitación: presencial en portoviejo/Manta/Manabí o virtual sincrónica (a elección de la EPA).
- Operación de campo: territorio de la provincia de Manabí.

---

## 12. Forma de cotización (proforma)

El proveedor presentará proforma con:

1. **Desglose** por líneas de **servicio** (y **licencia**, si aplica), en USD.
2. **Total** ≤ USD 10.000,00, más IVA si corresponde.
3. **Plazo** de validez de la proforma (mínimo 30 días).
4. **Nombre o razón social**, RUC, contacto.
5. Declaración de **no inhabilidad** para contratar con el Estado (según formato que exija la entidad).
6. Confirmación expresa de aceptación de alcance, exclusiones y entregables de este documento.

**Modelo de desglose sugerido (referencial; cifras a completar por el oferente):**

| Ítem | Concepto (servicio / bien) | Valor USD |
|------|-----------------------------|-----------|
| 1 | Servicio de habilitación, implementación y configuración EPIM | |
| 2 | Servicio de operación piloto (campo, validación, mapa) — 90 días | |
| 3 | Servicio de procesamiento de datos y reportes RUAA–EPA + tablero | |
| 4 | Servicio de capacitación | |
| 5 | Servicio de soporte y mantenimiento correctivo del piloto | |
| 6 | (Opcional) Licencia de uso del software — vigencia del piloto | |
| | **Total** | **≤ 10.000,00** |

---

## 13. Garantía y responsabilidad

- Por tratarse de servicio piloto, no se exige garantía de fiel cumplimiento de obra. La entidad podrá retener la aceptación final hasta subsanar observaciones técnicas objetivas en la única ronda prevista.
- El proveedor responde por defectos de prestación **atribuibles a su plataforma** durante el piloto, dentro del servicio de soporte.

---

## 14. Confidencialidad

Toda información de abonados, cuentas, autorizaciones y archivos RUAA/EPA es **confidencial**. El contratista firmará acuerdo de confidencialidad si la entidad lo dispone, o aceptará la cláusula en la orden de compra.

---

## 15. Anexos sugeridos para el expediente de ínfima cuantía

1. Este documento (especificaciones técnicas).
2. Justificación de la unidad requirente (gerencia Manabí / medición / comercial).
3. Certificación presupuestaria.
4. Proyecto de orden de compra (modelo SERCOP).
5. Capturas o enlace al entorno de demostración EPIM (opcional, no obligatorio para admitir proformas).

---

## 16. Referencia técnica del oferente (informativo)

Solución base: monorepo **EPIM** (marca operativa), desarrollo técnico `epacat`: aplicación móvil offline-first, API, portal web, módulo de cruce comercial RUAA/EPA. Documentación del repositorio institucional o del proveedor que la mantenga.

---

*Elaborado como plantilla técnica. No sustituye dictamen jurídico ni resolución de la máxima autoridad de la EPA.*