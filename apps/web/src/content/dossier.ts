export const dossier = {
  meta: {
    title: 'EPACAT — Catastro Inteligente | Portal Ejecutivo',
    description:
      'Plataforma de georreferenciación y control operativo para la Empresa Pública del Agua de Manabí, Ecuador.',
  },
  portal: {
    nav: [
      { label: 'Pilares', href: '#pilares' },
      { label: 'Arquitectura', href: '#arquitectura' },
      { label: 'Seguridad', href: '#seguridad' },
    ],
    hero: {
      eyebrow: 'Empresa Pública del Agua · Manabí, Ecuador',
      title: 'EPACAT: Catastro Inteligente',
      subtitle:
        'Plataforma de georreferenciación y control operativo para la Empresa Pública del Agua de Manabí.',
      ctaPrimary: 'Acceso al Portal Gerencial',
      ctaSecondary: 'Ver Arquitectura',
    },
    pillars: {
      title: 'Pilares tecnológicos',
      subtitle:
        'Arquitectura diseñada para operación en campo, validación gerencial y continuidad con sistemas corporativos.',
      items: [
        {
          id: 'offline',
          title: 'Operación Offline-First',
          description:
            'Los técnicos capturan lecturas, fotos y coordenadas GPS en zonas rurales sin conexión. Los datos se almacenan localmente y se sincronizan al recuperar red.',
          badge: 'En producción (demo)',
          icon: 'wifi-off' as const,
        },
        {
          id: 'ai',
          title: 'Lectura por IA',
          description:
            'Automatización de lectura de medidores mediante visión computacional para reducir errores humanos y acelerar el catastro.',
          badge: 'Planificado — roadmap',
          icon: 'scan' as const,
        },
        {
          id: 'epacom',
          title: 'Sincronización EPACOM',
          description:
            'Integración ordenada con el sistema comercial legacy mediante export validado. Solo registros aprobados por gerencia alcanzan EPACOM.',
          badge: 'Adapter stub activo',
          icon: 'refresh-cw' as const,
        },
      ],
    },
    architecture: {
      title: 'Arquitectura del ecosistema',
      layers: [
        { label: 'App móvil', detail: 'Expo · SQLite · Sync offline' },
        { label: 'API middleware', detail: 'NestJS · Validación · Fotos' },
        { label: 'PostgreSQL', detail: 'PostGIS · Catastro · Auditoría' },
        { label: 'Dashboard web', detail: 'Next.js · GIS · Cola gerencial' },
        { label: 'EPACOM', detail: 'Outbox JSON · Sin acoplamiento directo' },
      ],
    },
    security: {
      title: 'Seguridad y trazabilidad',
      subtitle:
        'Controles alineados a estándares de entidades públicas y operación crítica de infraestructura hídrica.',
      items: [
        {
          title: 'Soberanía de Datos',
          description:
            'Los datos de catastro residen en infraestructura controlada por la institución. Sin dependencia de nubes públicas para el núcleo operativo.',
          icon: 'database' as const,
        },
        {
          title: 'Encriptación de Extremo a Extremo',
          description:
            'Comunicaciones protegidas entre dispositivos de campo, API y dashboard. Tokens JWT para acceso gerencial.',
          icon: 'lock' as const,
        },
        {
          title: 'Auditoría en Tiempo Real',
          description:
            'Trazabilidad de técnicos en campo: quién capturó, cuándo, dónde y con qué evidencia fotográfica antes de aprobar export.',
          icon: 'activity' as const,
        },
      ],
    },
    footer: {
      copyright: '© 2026 — Proyecto EPACAT',
      tagline: 'Desarrollado para la modernización hídrica de Manabí',
      disclaimer: 'Entorno de demostración. No conectado a sistemas de producción.',
    },
  },
} as const;
