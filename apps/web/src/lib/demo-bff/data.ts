/** Datos alineados con packages/database/prisma/seed-demo.ts */
export type DemoPunto = {
  id: string;
  cedula: string;
  nombre: string;
  sector: string;
  lat: number;
  lng: number;
  validation: 'PENDING' | 'APPROVED' | 'REJECTED';
  observaciones: string;
  tecnico: string;
};

export const DEMO_PUNTOS: DemoPunto[] = [
  { id: 'v-demo-010', cedula: '1302001001', nombre: 'Rosa Quiroz', sector: 'Tarqui', lat: -0.9521, lng: -80.712, validation: 'PENDING', observaciones: 'Desalineación extracto vs RUAA — prioridad recaudación', tecnico: 'Carlos Mendoza' },
  { id: 'v-demo-011', cedula: '1302001002', nombre: 'Luis Anchundia', sector: '18 de Octubre', lat: -1.0562, lng: -80.452, validation: 'PENDING', observaciones: 'Sin cruce RUAA; requiere evidencia GPS', tecnico: 'Ana Villacís' },
  { id: 'v-demo-012', cedula: '1302001003', nombre: 'Patricia Franco', sector: 'Chone', lat: -0.6988, lng: -80.089, validation: 'PENDING', observaciones: 'Lectura sospechosa; revisión gerencial', tecnico: 'Carlos Mendoza' },
  { id: 'v-demo-013', cedula: '1302001004', nombre: 'Héctor Vera', sector: 'Montecristi', lat: -1.044, lng: -80.655, validation: 'PENDING', observaciones: 'Bomba de riego informal', tecnico: 'Ana Villacís' },
  { id: 'v-demo-016', cedula: '1302001007', nombre: 'Graciela Saltos', sector: 'Santa Ana', lat: -1.15, lng: -80.35, validation: 'PENDING', observaciones: 'Foto fachada pendiente de validar', tecnico: 'Carlos Mendoza' },
  { id: 'v-demo-017', cedula: '1302001008', nombre: 'Óscar Palma', sector: 'Pedernales', lat: 0.07, lng: -80.05, validation: 'PENDING', observaciones: 'Sector costero', tecnico: 'Ana Villacís' },
  { id: 'v-demo-019', cedula: '1302001010', nombre: 'Javier Noboa', sector: 'Flavio Alfaro', lat: -0.82, lng: -79.98, validation: 'PENDING', observaciones: 'Riego agrícola', tecnico: 'Carlos Mendoza' },
  { id: 'v-demo-020', cedula: '1302001011', nombre: 'Estefanía Vélez', sector: 'El Carmen', lat: -0.98, lng: -80.33, validation: 'PENDING', observaciones: 'Duplicado potencial en extracto', tecnico: 'Ana Villacís' },
  { id: 'v-demo-014', cedula: '1302001005', nombre: 'Carmen Intriago', sector: 'Jipijapa', lat: -1.092, lng: -80.578, validation: 'APPROVED', observaciones: 'Regularización aprobada', tecnico: 'Carlos Mendoza' },
  { id: 'v-demo-015', cedula: '1302001006', nombre: 'Fabián Mendoza', sector: 'Bolívar', lat: -0.85, lng: -80.16, validation: 'APPROVED', observaciones: 'Cuenta alineada', tecnico: 'Ana Villacís' },
  { id: 'v-demo-manta', cedula: '1301234567', nombre: 'Juan Pérez García', sector: 'Tarqui', lat: -0.9536, lng: -80.7089, validation: 'PENDING', observaciones: 'Visita de verificación catastral', tecnico: 'Carlos Mendoza' },
];

export const DEMO_USERS: Record<string, { password: string; role: string; nombre: string; id: string }> = {
  'gerente@epim.gob.ec': { password: 'epim123', role: 'MANAGER', nombre: 'María Delgado', id: 'demo-gerente' },
  'admin@epim.gob.ec': { password: 'epim123', role: 'ADMIN', nombre: 'Admin Sistema', id: 'demo-admin' },
  'tecnico1@epim.gob.ec': { password: 'epim123', role: 'TECHNICIAN', nombre: 'Carlos Mendoza', id: 'demo-tech1' },
};