import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EPIM — Dashboard',
  description: 'Portal de administración EPIM — EPA Manabí',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
