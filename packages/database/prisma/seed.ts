import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('epim123', 10);

  const tech1 = await prisma.user.upsert({
    where: { email: 'tecnico1@epim.gob.ec' },
    update: {},
    create: {
      email: 'tecnico1@epim.gob.ec',
      passwordHash,
      nombre: 'Carlos Mendoza',
      role: Role.TECHNICIAN,
    },
  });

  const tech2 = await prisma.user.upsert({
    where: { email: 'tecnico2@epim.gob.ec' },
    update: {},
    create: {
      email: 'tecnico2@epim.gob.ec',
      passwordHash,
      nombre: 'Ana Villacís',
      role: Role.TECHNICIAN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'gerente@epim.gob.ec' },
    update: {},
    create: {
      email: 'gerente@epim.gob.ec',
      passwordHash,
      nombre: 'María Delgado',
      role: Role.MANAGER,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@epim.gob.ec' },
    update: {},
    create: {
      email: 'admin@epim.gob.ec',
      passwordHash,
      nombre: 'Admin Sistema',
      role: Role.ADMIN,
    },
  });

  const abonado = await prisma.abonado.upsert({
    where: { clientId: '00000000-0000-4000-8000-000000000001' },
    update: { email: 'juan.perez@example.com' },
    create: {
      clientId: '00000000-0000-4000-8000-000000000001',
      cedula: '1301234567',
      nombre: 'Juan Pérez García',
      direccion: 'Av. Malecón 123, Manta',
      sector: 'Tarqui',
      telefono: '0991234567',
      email: 'juan.perez@example.com',
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

  await prisma.tarifa.upsert({
    where: { id: 'tarifa-residencial-default' },
    update: {},
    create: {
      id: 'tarifa-residencial-default',
      nombre: 'Residencial estándar',
      cargoFijo: 2.5,
      precioM3: 0.45,
      activa: true,
    },
  });

  const now = new Date();
  const anio = now.getFullYear();
  const mes = now.getMonth() + 1;
  const fechaInicio = new Date(anio, mes - 1, 1);
  const fechaFin = new Date(anio, mes, 0, 23, 59, 59, 999);

  await prisma.periodoFacturacion.upsert({
    where: { anio_mes: { anio, mes } },
    update: {},
    create: {
      anio,
      mes,
      status: 'ABIERTO',
      fechaInicio,
      fechaFin,
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
