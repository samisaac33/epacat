-- New enums
CREATE TYPE "PagoOrigen" AS ENUM ('MANUAL', 'BANCO_PACIFICO');
CREATE TYPE "PagoCanal" AS ENUM ('VENTANILLA', 'BANCA_WEB', 'BANCA_MOVIL', 'MANUAL');
CREATE TYPE "CobranzaEmailTipo" AS ENUM ('FACTURA_EMITIDA', 'RECORDATORIO', 'COMPROBANTE_PAGO', 'VENCIMIENTO');
CREATE TYPE "CobranzaEmailStatus" AS ENUM ('SENT', 'STUB', 'FAILED');

-- Extend MetodoPago
ALTER TYPE "MetodoPago" ADD VALUE IF NOT EXISTS 'PACIFICO_VENTANILLA';
ALTER TYPE "MetodoPago" ADD VALUE IF NOT EXISTS 'PACIFICO_BANCA_WEB';
ALTER TYPE "MetodoPago" ADD VALUE IF NOT EXISTS 'PACIFICO_BANCA_MOVIL';

-- Abonado: email and ruc
ALTER TABLE "Abonado" ADD COLUMN IF NOT EXISTS "ruc" TEXT;
ALTER TABLE "Abonado" ADD COLUMN IF NOT EXISTS "email" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Abonado_ruc_key" ON "Abonado"("ruc");

-- Pago: bank fields
ALTER TABLE "Pago" ADD COLUMN IF NOT EXISTS "origen" "PagoOrigen" NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "Pago" ADD COLUMN IF NOT EXISTS "canal" "PagoCanal";
ALTER TABLE "Pago" ADD COLUMN IF NOT EXISTS "transaccionBancoId" TEXT;
ALTER TABLE "Pago" ADD COLUMN IF NOT EXISTS "revertido" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Pago" ALTER COLUMN "registradoPorId" DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Pago_transaccionBancoId_key" ON "Pago"("transaccionBancoId");

-- CobranzaEmail
CREATE TABLE "CobranzaEmail" (
    "id" TEXT NOT NULL,
    "facturaId" TEXT,
    "abonadoId" TEXT NOT NULL,
    "tipo" "CobranzaEmailTipo" NOT NULL,
    "destino" TEXT NOT NULL,
    "resendId" TEXT,
    "status" "CobranzaEmailStatus" NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CobranzaEmail_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CobranzaEmail" ADD CONSTRAINT "CobranzaEmail_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CobranzaEmail" ADD CONSTRAINT "CobranzaEmail_abonadoId_fkey" FOREIGN KEY ("abonadoId") REFERENCES "Abonado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
