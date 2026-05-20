-- CreateExtension
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TECHNICIAN', 'MANAGER', 'ADMIN');
CREATE TYPE "SyncBatchStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');
CREATE TYPE "SyncOpType" AS ENUM ('CREATE', 'UPDATE');
CREATE TYPE "SyncEntity" AS ENUM ('ABONADO', 'MEDIDOR', 'VISITA', 'LECTURA');
CREATE TYPE "ValidationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "VisitaStatus" AS ENUM ('DRAFT', 'SYNCED', 'VALIDATED', 'REJECTED');
CREATE TYPE "FotoTipo" AS ENUM ('MEDIDOR', 'FACHADA', 'LECTURA');
CREATE TYPE "EpacomJobStatus" AS ENUM ('PENDING', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TECHNICIAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Abonado" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "telefono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Abonado_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Medidor" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "numeroSerie" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "ubicacion" TEXT,
    "abonadoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Medidor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VisitaCampo" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "observaciones" TEXT,
    "status" "VisitaStatus" NOT NULL DEFAULT 'DRAFT',
    "tecnicoId" TEXT NOT NULL,
    "abonadoId" TEXT,
    "medidorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VisitaCampo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Lectura" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "medidorId" TEXT NOT NULL,
    "visitaId" TEXT,
    "fotoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lectura_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Foto" (
    "id" TEXT NOT NULL,
    "localPhotoId" TEXT,
    "path" TEXT NOT NULL,
    "tipo" "FotoTipo" NOT NULL,
    "visitaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SyncBatch" (
    "id" TEXT NOT NULL,
    "clientBatchId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "status" "SyncBatchStatus" NOT NULL DEFAULT 'PENDING',
    "resultJson" JSONB,
    "tecnicoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    CONSTRAINT "SyncBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SyncOperation" (
    "id" TEXT NOT NULL,
    "opId" TEXT NOT NULL,
    "type" "SyncOpType" NOT NULL,
    "entity" "SyncEntity" NOT NULL,
    "clientEntityId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "batchId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    CONSTRAINT "SyncOperation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Validacion" (
    "id" TEXT NOT NULL,
    "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "comentario" TEXT,
    "visitaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Validacion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EpacomExportJob" (
    "id" TEXT NOT NULL,
    "visitaId" TEXT NOT NULL,
    "status" "EpacomJobStatus" NOT NULL DEFAULT 'PENDING',
    "outputPath" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    CONSTRAINT "EpacomExportJob_pkey" PRIMARY KEY ("id")
);

-- PostGIS location column for GIS queries
ALTER TABLE "VisitaCampo" ADD COLUMN "location" geography(Point, 4326);
UPDATE "VisitaCampo" SET "location" = ST_SetSRID(ST_MakePoint("lng", "lat"), 4326)::geography;
CREATE INDEX "VisitaCampo_location_idx" ON "VisitaCampo" USING GIST ("location");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Abonado_clientId_key" ON "Abonado"("clientId");
CREATE UNIQUE INDEX "Abonado_cedula_key" ON "Abonado"("cedula");
CREATE UNIQUE INDEX "Medidor_clientId_key" ON "Medidor"("clientId");
CREATE UNIQUE INDEX "Medidor_numeroSerie_key" ON "Medidor"("numeroSerie");
CREATE UNIQUE INDEX "VisitaCampo_clientId_key" ON "VisitaCampo"("clientId");
CREATE UNIQUE INDEX "Lectura_clientId_key" ON "Lectura"("clientId");
CREATE UNIQUE INDEX "Foto_localPhotoId_key" ON "Foto"("localPhotoId");
CREATE UNIQUE INDEX "SyncBatch_clientBatchId_key" ON "SyncBatch"("clientBatchId");
CREATE UNIQUE INDEX "Validacion_visitaId_key" ON "Validacion"("visitaId");

-- AddForeignKey
ALTER TABLE "Medidor" ADD CONSTRAINT "Medidor_abonadoId_fkey" FOREIGN KEY ("abonadoId") REFERENCES "Abonado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VisitaCampo" ADD CONSTRAINT "VisitaCampo_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VisitaCampo" ADD CONSTRAINT "VisitaCampo_abonadoId_fkey" FOREIGN KEY ("abonadoId") REFERENCES "Abonado"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VisitaCampo" ADD CONSTRAINT "VisitaCampo_medidorId_fkey" FOREIGN KEY ("medidorId") REFERENCES "Medidor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lectura" ADD CONSTRAINT "Lectura_medidorId_fkey" FOREIGN KEY ("medidorId") REFERENCES "Medidor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Lectura" ADD CONSTRAINT "Lectura_visitaId_fkey" FOREIGN KEY ("visitaId") REFERENCES "VisitaCampo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lectura" ADD CONSTRAINT "Lectura_fotoId_fkey" FOREIGN KEY ("fotoId") REFERENCES "Foto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_visitaId_fkey" FOREIGN KEY ("visitaId") REFERENCES "VisitaCampo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SyncBatch" ADD CONSTRAINT "SyncBatch_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SyncOperation" ADD CONSTRAINT "SyncOperation_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "SyncBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Validacion" ADD CONSTRAINT "Validacion_visitaId_fkey" FOREIGN KEY ("visitaId") REFERENCES "VisitaCampo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Trigger to keep location in sync with lat/lng
CREATE OR REPLACE FUNCTION sync_visita_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER visita_location_trigger
BEFORE INSERT OR UPDATE OF lat, lng ON "VisitaCampo"
FOR EACH ROW EXECUTE FUNCTION sync_visita_location();
