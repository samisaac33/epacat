import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EPACAT — Dashboard',
  description: 'Validación gerencial y mapa GIS — Empresa Pública del Agua',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
