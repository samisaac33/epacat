import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('epacat123', 10);

  const tech1 = await prisma.user.upsert({
    where: { email: 'tecnico1@epacat.gob.ec' },
    update: {},
    create: {
      email: 'tecnico1@epacat.gob.ec',
      passwordHash,
      nombre: 'Carlos Mendoza',
      role: Role.TECHNICIAN,
    },
  });

  const tech2 = await prisma.user.upsert({
    where: { email: 'tecnico2@epacat.gob.ec' },
    update: {},
    create: {
      email: 'tecnico2@epacat.gob.ec',
      passwordHash,
      nombre: 'Ana Villacís',
      role: Role.TECHNICIAN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'gerente@epacat.gob.ec' },
    update: {},
    create: {
      email: 'gerente@epacat.gob.ec',
      passwordHash,
      nombre: 'María Delgado',
      role: Role.MANAGER,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@epacat.gob.ec' },
    update: {},
    create: {
      email: 'admin@epacat.gob.ec',
      passwordHash,
      nombre: 'Admin Sistema',
      role: Role.ADMIN,
    },
  });

  const abonado = await prisma.abonado.upsert({
    where: { clientId: '00000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      clientId: '00000000-0000-4000-8000-000000000001',
      cedula: '1301234567',
      nombre: 'Juan Pérez García',
      direccion: 'Av. Malecón 123, Manta',
      sector: 'Tarqui',
      telefono: '0991234567',
    },
  });

  const medidor = await prisma.medidor.upsert({
    where: { clientId: '00000000-0000-4000-8000-000000000002' },
    update: {},
    create: {
      clientId: '00000000-0000-4000-8000-000000000002',
      numeroSerie: 'MED-2024-001',
      marca: 'Sensus',
      ubicacion: 'Fachada principal',
      abonadoId: abonado.id,
    },
  });

  const visita = await prisma.visitaCampo.upsert({
    where: { clientId: '00000000-0000-4000-8000-000000000003' },
    update: {},
    create: {
      clientId: '00000000-0000-4000-8000-000000000003',
      lat: -0.9536,
      lng: -80.7089,
      observaciones: 'Visita de verificación catastral',
      status: 'SYNCED',
      tecnicoId: tech1.id,
      abonadoId: abonado.id,
      medidorId: medidor.id,
    },
  });

  await prisma.$executeRaw`
    UPDATE "VisitaCampo"
    SET location = ST_SetSRID(ST_MakePoint(${visita.lng}, ${visita.lat}), 4326)::geography
    WHERE id = ${visita.id}
  `;

  await prisma.lectura.upsert({
    where: { clientId: '00000000-0000-4000-8000-000000000004' },
    update: {},
    create: {
      clientId: '00000000-0000-4000-8000-000000000004',
      valor: 1250.5,
      fecha: new Date(),
      medidorId: medidor.id,
      visitaId: visita.id,
    },
  });

  await prisma.validacion.upsert({
    where: { visitaId: visita.id },
    update: {},
    create: {
      visitaId: visita.id,
      status: 'PENDING',
    },
  });

  console.log('Seed completado:', { tech1: tech1.email, tech2: tech2.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
