export type LandingIcon =
  | 'wifi-off'
  | 'scan'
  | 'refresh-cw'
  | 'map-pin'
  | 'clipboard-check'
  | 'users'
  | 'database'
  | 'lock'
  | 'activity'
  | 'camera'
  | 'cloud-upload'
  | 'shield'
  | 'file-output'
  | 'gauge'
  | 'building';

export type LandingBadge = 'available' | 'roadmap' | 'integration';

export const dossier = {
  meta: {
    title: 'EPIM — Inteligencia de Medición | EPA Manabí',
    description:
      'Solución integral para la EPA Manabí: registro en campo, revisión en oficina, mapa territorial, facturación y cobro con Banco Pacífico.',
  },
  portal: {
    nav: [
      { label: 'Alcance', href: '#alcance' },
      { label: 'Cómo funciona', href: '#flujo' },
      { label: 'Roles', href: '#modulos' },
      { label: 'Soluciones', href: '#capacidades' },
      { label: 'Seguridad', href: '#seguridad' },
    ],
    hero: {
      eyebrow: 'Empresa Pública del Agua · Manabí, Ecuador',
      acronym: 'EPIM',
      acronymExpansion:
        'Empresa Pública del Agua (Manabí) — Inteligencia de Medición',
      title: 'Control del servicio de agua, de la visita en campo al cobro',
      subtitle:
        'Un solo sistema para registrar abonados y lecturas en territorio, revisar la información en oficina, facturar con respaldo y cobrar a través de Banco Pacífico.',
      ctaPrimary: 'Acceso al portal de administración',
      ctaSecondary: 'Ver cómo funciona',
      ctaSecondaryHref: '#flujo',
      pilotNote:
        'Versión piloto para demostración. Aún no está conectada a los sistemas de producción de la institución.',
    },
    scope: {
      id: 'alcance',
      title: 'El reto y la respuesta de EPIM',
      subtitle:
        'En Manabí hay sectores urbanos y rurales donde la señal de internet falla. No se puede depender de planillas sueltas ni de datos que lleguen sin revisión.',
      challenges: [
        {
          title: 'Territorio extenso',
          description:
            'Los técnicos trabajan lejos de la oficina. Necesitan registrar visitas aunque no haya internet y enviar la información cuando vuelva la conexión.',
        },
        {
          title: 'Datos sin control',
          description:
            'Si una lectura o ubicación incorrecta entra directo a facturación, la institución pierde tiempo corrigiendo y el abonado pierde confianza.',
        },
        {
          title: 'Información repartida',
          description:
            'La administración necesita ver en un solo lugar el mapa de visitas, el listado de abonados y el estado de la cobranza.',
        },
      ],
      outcome:
        'EPIM une todo el proceso: captura en campo, revisión en oficina, mapa territorial, facturación mensual y cobro bancario con comprobante al abonado.',
    },
    workflow: {
      id: 'flujo',
      title: 'Cómo funciona',
      subtitle:
        'Desde la visita al medidor hasta el pago del abonado, con pasos claros y responsables definidos.',
      steps: [
        {
          step: 1,
          title: 'Registro en campo',
          description:
            'El técnico anota al abonado, el medidor, la lectura, la ubicación y una foto. Si no hay internet, todo queda guardado en el celular.',
          icon: 'camera' as LandingIcon,
        },
        {
          step: 2,
          title: 'Envío a la oficina',
          description:
            'Cuando hay conexión, la información y las fotos se envían al sistema. Si algo falta o está mal, el técnico puede corregirlo.',
          icon: 'cloud-upload' as LandingIcon,
        },
        {
          step: 3,
          title: 'Revisión en administración',
          description:
            'En oficina se revisa cada visita: lectura, ubicación y evidencias. Solo lo aprobado sigue adelante.',
          icon: 'clipboard-check' as LandingIcon,
        },
        {
          step: 4,
          title: 'Facturación del mes',
          description:
            'Al cerrar el periodo se calcula el consumo, se aplica la tarifa vigente y se genera la factura de cada abonado.',
          icon: 'gauge' as LandingIcon,
        },
        {
          step: 5,
          title: 'Cobro con Banco Pacífico',
          description:
            'El abonado paga en ventanilla o por banca en línea con su cédula o RUC. El sistema confirma el pago al instante y envía comprobante por correo.',
          icon: 'gauge' as LandingIcon,
        },
      ],
    },
    modules: {
      id: 'modulos',
      title: 'Dos frentes de trabajo',
      subtitle:
        'Personal de campo y personal de administración, cada uno con las herramientas que necesita.',
      roles: [
        {
          id: 'field',
          title: 'Técnico de campo',
          subtitle: 'Aplicación móvil EPIM',
          badge: 'available' as LandingBadge,
          items: [
            'Registrar visitas con ubicación y foto del medidor',
            'Anotar abonado, medidor y lectura en un solo paso',
            'Trabajar sin internet y sincronizar después',
            'Consultar las visitas hechas en el dispositivo',
            'Enviar la información cuando haya señal',
          ],
        },
        {
          id: 'management',
          title: 'Administración',
          subtitle: 'Portal web EPIM',
          badge: 'available' as LandingBadge,
          items: [
            'Aprobar o rechazar visitas con comentario',
            'Ver visitas en mapa de la provincia',
            'Consultar abonados, sectores y medidores',
            'Cerrar periodos y emitir facturas',
            'Seguir pagos y saldos pendientes',
          ],
        },
      ],
    },
    capabilities: {
      id: 'capacidades',
      title: 'Qué resuelve EPIM',
      subtitle:
        'Funciones concretas para mejorar el servicio y la recaudación de la EPA Manabí.',
      items: [
        {
          id: 'offline',
          title: 'Trabajo sin internet',
          description:
            'Los técnicos registran lecturas y ubicaciones aunque no haya señal. Al recuperar conexión, la información se envía sola.',
          badge: 'available' as LandingBadge,
          icon: 'wifi-off' as LandingIcon,
        },
        {
          id: 'evidence',
          title: 'Foto y ubicación de respaldo',
          description:
            'Cada visita queda documentada. Así se reducen reclamos por lecturas dudosas o direcciones mal anotadas.',
          badge: 'available' as LandingBadge,
          icon: 'camera' as LandingIcon,
        },
        {
          id: 'validation',
          title: 'Revisión antes de facturar',
          description:
            'Ningún dato de campo pasa a la factura sin pasar por la administración. Todo queda registrado: quién aprobó y cuándo.',
          badge: 'available' as LandingBadge,
          icon: 'clipboard-check' as LandingIcon,
        },
        {
          id: 'gis',
          title: 'Mapa territorial',
          description:
            'Visualice en un mapa dónde se han realizado visitas y cómo avanza la cobertura en Manabí.',
          badge: 'available' as LandingBadge,
          icon: 'map-pin' as LandingIcon,
        },
        {
          id: 'catastro',
          title: 'Padron de abonados',
          description:
            'Listado único de abonados, direcciones, sectores y medidores, disponible para consulta en el portal.',
          badge: 'available' as LandingBadge,
          icon: 'users' as LandingIcon,
        },
        {
          id: 'billing',
          title: 'Cobro con Banco Pacífico',
          description:
            'Convenio con el banco estatal: el abonado consulta y paga con cédula o RUC; la EPA recibe la confirmación al momento.',
          badge: 'available' as LandingBadge,
          icon: 'gauge' as LandingIcon,
        },
      ],
    },
    billing: {
      id: 'facturacion',
      title: 'Facturación y cobro con Banco Pacífico',
      subtitle:
        'Formas de pago sencillas para el abonado e integración directa con el sistema de la EPA.',
      points: [
        {
          title: 'Pago en ventanilla',
          description:
            'El abonado indica que desea pagar el servicio de agua de la EPA. Con cédula o RUC, el cajero ve el monto y registra el pago.',
        },
        {
          title: 'Banca en línea y móvil',
          description:
            'La EPA Manabí aparece entre las instituciones de pago del Banco Pacífico. El abonado usa la misma cédula o RUC.',
        },
        {
          title: 'Avisos por correo',
          description:
            'Se envía factura emitida, recordatorio de pago y comprobante cuando el abonado tiene correo registrado.',
        },
      ],
      badge: 'available' as LandingBadge,
    },
    benefits: {
      id: 'beneficios',
      title: 'Beneficios para la administración',
      subtitle:
        'Resultados que la institución puede medir desde el primer despliegue piloto.',
      items: [
        {
          title: 'Todo queda registrado',
          description:
            'Se sabe quién visitó, cuándo, dónde y con qué evidencia, antes de facturar o cobrar.',
          icon: 'activity' as LandingIcon,
        },
        {
          title: 'Menos errores y reclamos',
          description:
            'La revisión en oficina evita que lleguen a cobranza lecturas mal tomadas o datos incompletos.',
          icon: 'gauge' as LandingIcon,
        },
        {
          title: 'Mejor control territorial',
          description:
            'Mapa y padrón unificados para decidir en qué sectores reforzar visitas y cobertura.',
          icon: 'map-pin' as LandingIcon,
        },
        {
          title: 'Datos bajo control institucional',
          description:
            'La información del servicio se mantiene en servidores de la entidad, sin depender de plataformas externas obligatorias.',
          icon: 'database' as LandingIcon,
        },
      ],
    },
    security: {
      id: 'seguridad',
      title: 'Seguridad y confianza',
      subtitle:
        'Controles acordes a un servicio público esencial y al manejo responsable de datos de los abonados.',
      items: [
        {
          title: 'Accesos diferenciados',
          description:
            'Técnicos, personal de administración y administradores del sistema ven solo lo que su función requiere.',
          icon: 'shield' as LandingIcon,
        },
        {
          title: 'Comunicación protegida',
          description:
            'La información viaja cifrada entre la aplicación móvil, el servidor y el portal web.',
          icon: 'lock' as LandingIcon,
        },
        {
          title: 'Historial de cada visita',
          description:
            'Queda constancia de captura, revisión, facturación y pagos, con comentarios cuando corresponda.',
          icon: 'activity' as LandingIcon,
        },
        {
          title: 'Infraestructura propia',
          description:
            'Catastro, facturas y evidencias se alojan en equipos bajo responsabilidad de la EPA.',
          icon: 'database' as LandingIcon,
        },
      ],
    },
    roadmap: {
      id: 'roadmap',
      title: 'Próximas mejoras',
      subtitle: 'Evolución prevista después del piloto de demostración.',
      items: [
        {
          title: 'Lectura automática del medidor',
          description:
            'Apoyo con cámara del celular para leer el medidor con menos error humano.',
          badge: 'roadmap' as LandingBadge,
          icon: 'scan' as LandingIcon,
        },
        {
          title: 'Comprobantes en PDF y más medios de pago',
          description:
            'Recibos descargables y ampliación de formas de pago en línea.',
          badge: 'roadmap' as LandingBadge,
          icon: 'file-output' as LandingIcon,
        },
      ],
    },
    cta: {
      title: 'Ingrese al portal de administración',
      subtitle:
        'Revise visitas, emita facturas, consulte el mapa y el padrón de abonados — EPA Manabí.',
    },
    footer: {
      copyright: '© 2026 — EPIM · Empresa Pública del Agua (Manabí)',
      tagline: 'Inteligencia de medición al servicio del agua potable en Manabí',
      disclaimer:
        'Entorno de demostración (piloto). No conectado a sistemas de producción institucional.',
    },
  },
} as const;

export const badgeLabels: Record<LandingBadge, string> = {
  available: 'Disponible en piloto',
  roadmap: 'Próximamente',
  integration: 'Convenio activo',
};
