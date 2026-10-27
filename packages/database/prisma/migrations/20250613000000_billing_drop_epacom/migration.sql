-- Drop EPACOM
DROP TABLE IF EXISTS "EpacomExportJob";
DROP TYPE IF EXISTS "EpacomJobStatus";

-- Billing enums
CREATE TYPE "PeriodoStatus" AS ENUM ('ABIERTO', 'CERRADO');
CREATE TYPE "FacturaStatus" AS ENUM ('EMITIDA', 'PAGADA', 'VENCIDA', 'ANULADA');
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'OTRO');

-- Tarifa
CREATE TABLE "Tarifa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cargoFijo" DOUBLE PRECISION NOT NULL,
    "precioM3" DOUBLE PRECISION NOT NULL,
    "vigenteDesde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarifa_pkey" PRIMARY KEY ("id")
);

-- PeriodoFacturacion
CREATE TABLE "PeriodoFacturacion" (
    "id" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "status" "PeriodoStatus" NOT NULL DEFAULT 'ABIERTO',
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "cerradoAt" TIMESTAMP(3),
    "cerradoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PeriodoFacturacion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PeriodoFacturacion_anio_mes_key" ON "PeriodoFacturacion"("anio", "mes");

ALTER TABLE "PeriodoFacturacion" ADD CONSTRAINT "PeriodoFacturacion_cerradoPorId_fkey" FOREIGN KEY ("cerradoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Factura
CREATE TABLE "Factura" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "abonadoId" TEXT NOT NULL,
    "periodoId" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "cargoFijo" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "status" "FacturaStatus" NOT NULL DEFAULT 'EMITIDA',
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Factura_numero_key" ON "Factura"("numero");

ALTER TABLE "Factura" ADD CONSTRAINT "Factura_abonadoId_fkey" FOREIGN KEY ("abonadoId") REFERENCES "Abonado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "PeriodoFacturacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- FacturaLinea
CREATE TABLE "FacturaLinea" (
    "id" TEXT NOT NULL,
    "facturaId" TEXT NOT NULL,
    "medidorId" TEXT NOT NULL,
    "lecturaAnteriorId" TEXT,
    "lecturaActualId" TEXT NOT NULL,
    "consumo" DOUBLE PRECISION NOT NULL,
    "precioM3" DOUBLE PRECISION NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FacturaLinea_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FacturaLinea_lecturaActualId_key" ON "FacturaLinea"("lecturaActualId");

ALTER TABLE "FacturaLinea" ADD CONSTRAINT "FacturaLinea_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FacturaLinea" ADD CONSTRAINT "FacturaLinea_medidorId_fkey" FOREIGN KEY ("medidorId") REFERENCES "Medidor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FacturaLinea" ADD CONSTRAINT "FacturaLinea_lecturaAnteriorId_fkey" FOREIGN KEY ("lecturaAnteriorId") REFERENCES "Lectura"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FacturaLinea" ADD CONSTRAINT "FacturaLinea_lecturaActualId_fkey" FOREIGN KEY ("lecturaActualId") REFERENCES "Lectura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Pago
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "facturaId" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "metodo" "MetodoPago" NOT NULL,
    "referencia" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registradoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Pago" ADD CONSTRAINT "Pago_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
