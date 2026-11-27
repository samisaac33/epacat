/**
 * Datos ampliados para demo institucional Manabí (mapa + cola de validación).
 * Ejecutar después de prisma/seed.ts
 */
import { PrismaClient, ValidationStatus, VisitaStatus } from '@prisma/client';

const prisma = new PrismaClient();

type Punto = {
  clientSuffix: string;
  cedula: string;
  nombre: string;
  direccion: string;
  sector: string;
  lat: number;
  lng: number;
  validation: ValidationStatus;
  visitaStatus: VisitaStatus;
  observaciones: string;
};

const PUNTOS: Punto[] = [
  {
    clientSuffix: 'demo-010',
    cedula: '1302001001',
    nombre: 'Rosa Quiroz',
    direccion: 'Cdla. Los Ángeles, Manta',
    sector: 'Tarqui',
    lat: -0.9521,
    lng: -80.712,
    validation: ValidationStatus.PENDING,
    visitaStatus: VisitaStatus.SYNCED,
    observaciones: 'Desalineación extracto vs RUAA — prioridad recaudación',
  },
  {
    clientSuffix: 'demo-011',
    cedula: '1302001002',
    nombre: 'Luis Anchundia',
    direccion: 'Av. 24 de Mayo, Portoviejo',
    sector: '18 de Octubre',
    lat: -1.0562,
    lng: -80.452,
    validation: ValidationStatus.PENDING,
    visitaStatus: VisitaStatus.SYNCED,
    observaciones: 'Sin cruce RUAA; requiere evidencia GPS',
  },
  {
    clientSuffix: 'demo-012',
    cedula: '1302001003',
    nombre: 'Patricia Franco',
    direccion: 'Parroquia Chone centro',
    sector: 'Chone',
    lat: -0.6988,
    lng: -80.089,
    validation: ValidationStatus.PENDING,
    visitaStatus: VisitaStatus.SYNCED,
    observaciones: 'Lectura sospechosa; revisión gerencial',
  },
  {
    clientSuffix: 'demo-013',
    cedula: '1302001004',
    nombre: 'Héctor Vera',
    direccion: 'Montecristi, sector rural',
    sector: 'Montecristi',
    lat: -1.044,
    lng: -80.655,
    validation: ValidationStatus.PENDING,
    visitaStatus: VisitaStatus.SYNCED,
    observaciones: 'Bomba de riego informal',
  },
  {
    clientSuffix: 'demo-014',
    cedula: '1302001005',
    nombre: 'Carmen Intriago',
    direccion: 'Jipijapa, calle 10 de Agosto',
    sector: 'Jipijapa',
    lat: -1.092,
    lng: -80.578,
    validation: ValidationStatus.APPROVED,
    visitaStatus: VisitaStatus.VALIDATED,
    observaciones: 'Regularización aprobada con evidencia',
  },
  {
    clientSuffix: 'demo-015',
    cedula: '1302001006',
    nombre: 'Fabián Mendoza',
    direccion: 'Calceta, av. Amazonas',
    sector: 'Bolívar',
    lat: -0.85,
    lng: -80.16,
    validation: ValidationStatus.APPROVED,
    visitaStatus: VisitaStatus.VALIDATED,
    observaciones: 'Cuenta alineada post-visita',
  },
  {
    clientSuffix: 'demo-016',
    cedula: '1302001007',
    nombre: 'Graciela Saltos',
    direccion: 'Santa Ana de Vuelta Larga',
    sector: 'Santa Ana',
    lat: -1.15,
    lng: -80.35,
    validation: ValidationStatus.PENDING,
    visitaStatus: VisitaStatus.SYNCED,
    observaciones: 'Foto fachada pendiente de validar',
  },
  {
    clientSuffix: 'demo-017',
    cedula: '1302001008',
    nombre: 'Óscar Palma',
    direccion: 'Pedernales, malecón',
    sector: 'Pedernales',
    lat: 0.07,
    lng: -80.05,
    validation: ValidationStatus.PENDING,
    visitaStatus: VisitaStatus.SYNCED,
    observaciones: 'Sector costero — turismo y agua',
  },
  {
    clientSuffix: 'demo-018',
    cedula: '1302001009',
    nombre: 'Mónica Loor',
    direccion: 'Bahía de Caráquez',
    sector: 'Sucre',
    lat: -0.598,
    lng: -80.424,
    validation: ValidationStatus.REJECTED,
    visitaStatus: VisitaStatus.REJECTED,
    observaciones: 'Visita rechazada: coordenadas inconsistentes',
  },
  {
    clientSuffix: 'demo-019',
    cedula: '1302001010',
    nombre: 'Javier Noboa',
    direccion: 'Flavio Alfaro, comunidad agrícola',
    sector: 'Flavio Alfaro',
    lat: -0.82,
    lng: -79.98,
    validation: ValidationStatus.PENDING,
    visitaStatus: VisitaStatus.SYNCED,
    observaciones: 'Riego agrícola — volumen estimado alto',
  },
  {
    clientSuffix: 'demo-020',
    cedula: '1302001011',
    nombre: 'Estefanía Vélez',
    direccion: 'El Carmen, barrio central',
    sector: 'El Carmen',
    lat: -0.98,
    lng: -80.33,
    validation: ValidationStatus.PENDING,
    visitaStatus: VisitaStatus.SYNCED,
    observaciones: 'Duplicado potencial en extracto',
  },
  {
    clientSuffix: 'demo-021',
    cedula: '1302001012',
    nombre: 'Ramón Zambrano',
    direccion: 'Paján, camino vecinal',
    sector: 'Paján',
    lat: -1.02,
    lng: -80.43,
    validation: ValidationStatus.APPROVED,
    visitaStatus: VisitaStatus.VALIDATED,
    observaciones: 'Validado para expediente',
  },
];

function uuidFromSuffix(suffix: string, kind: string): string {
  const n = parseInt(suffix.replace(/\D/g, ''), 10) || 1;
  const tail = ((n << 4) + kind.charCodeAt(0)).toString(16).padStart(12, '0').slice(-12);
  return `00000000-0000-4000-8000-${tail}`;
}

async function main() {
  const tech1 = await prisma.user.findUnique({ where: { email: 'tecnico1@epim.gob.ec' } });
  const tech2 = await prisma.user.findUnique({ where: { email: 'tecnico2@epim.gob.ec' } });
  if (!tech1 || !tech2) {
    console.error('Ejecute primero: npm run db:seed');
    process.exit(1);
  }

  const fotoPath = 'demo/placeholder-visita.jpg';

  for (let i = 0; i < PUNTOS.length; i++) {
    const p = PUNTOS[i];
    const tecnico = i % 2 === 0 ? tech1 : tech2;
    const abonadoClientId = uuidFromSuffix(p.clientSuffix, 'a1');
    const medidorClientId = uuidFromSuffix(p.clientSuffix, 'b2');
    const visitaClientId = uuidFromSuffix(p.clientSuffix, 'c3');
    const lecturaClientId = uuidFromSuffix(p.clientSuffix, 'd4');

    const abonado = await prisma.abonado.upsert({
      where: { clientId: abonadoClientId },
      update: { direccion: p.direccion, sector: p.sector },
      create: {
        clientId: abonadoClientId,
        cedula: p.cedula,
        nombre: p.nombre,
        direccion: p.direccion,
        sector: p.sector,
        telefono: '099' + p.cedula.slice(-7),
      },
    });

    const medidor = await prisma.medidor.upsert({
      where: { clientId: medidorClientId },
      update: {},
      create: {
        clientId: medidorClientId,
        numeroSerie: `DEMO-${p.clientSuffix.toUpperCase()}`,
        marca: 'Zenner',
        ubicacion: 'Fachada',
        abonadoId: abonado.id,
      },
    });

    const visita = await prisma.visitaCampo.upsert({
      where: { clientId: visitaClientId },
      update: {
        status: p.visitaStatus,
        observaciones: p.observaciones,
        lat: p.lat,
        lng: p.lng,
      },
      create: {
        clientId: visitaClientId,
        lat: p.lat,
        lng: p.lng,
        observaciones: p.observaciones,
        status: p.visitaStatus,
        tecnicoId: tecnico.id,
        abonadoId: abonado.id,
        medidorId: medidor.id,
      },
    });

    await prisma.$executeRaw`
      UPDATE "VisitaCampo"
      SET location = ST_SetSRID(ST_MakePoint(${p.lng}, ${p.lat}), 4326)::geography
      WHERE id = ${visita.id}
    `;

    await prisma.lectura.upsert({
      where: { clientId: lecturaClientId },
      update: { valor: 800 + i * 37.5 },
      create: {
        clientId: lecturaClientId,
        valor: 800 + i * 37.5,
        fecha: new Date(),
        medidorId: medidor.id,
        visitaId: visita.id,
      },
    });

    const existingFoto = await prisma.foto.findFirst({ where: { visitaId: visita.id } });
    if (!existingFoto) {
      await prisma.foto.create({
        data: {
          path: fotoPath,
          tipo: 'FACHADA',
          visitaId: visita.id,
        },
      });
    }

    await prisma.validacion.upsert({
      where: { visitaId: visita.id },
      update: {
        status: p.validation,
        comentario:
          p.validation === ValidationStatus.REJECTED
            ? 'Rechazado en demo: revisar coordenadas'
            : null,
      },
      create: {
        visitaId: visita.id,
        status: p.validation,
      },
    });
  }

  const pending = await prisma.validacion.count({ where: { status: ValidationStatus.PENDING } });
  const visitas = await prisma.visitaCampo.count();
  console.log('Seed demo Manabí:', { visitas, validacionesPendientes: pending });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());