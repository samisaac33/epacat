'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { GeoJsonFeatureCollection } from '@epacat/shared';
import Link from 'next/link';

// Fix default marker icons in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Props {
  data: GeoJsonFeatureCollection;
}

export function VisitaMap({ data }: Props) {
  const center: [number, number] =
    data.features.length > 0
      ? [data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]]
      : [-0.9536, -80.7089];

  return (
    <MapContainer center={center} zoom={13} className="h-[600px] w-full rounded-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {data.features.map((f) => {
        const [lng, lat] = f.geometry.coordinates;
        const id = f.properties.id as string;
        return (
          <Marker key={id} position={[lat, lng]} icon={icon}>
            <Popup>
              <div className="text-sm">
                <p>
                  <strong>{String(f.properties.abonadoNombre ?? 'Sin abonado')}</strong>
                </p>
                <p>Técnico: {String(f.properties.tecnicoNombre)}</p>
                <p>Estado: {String(f.properties.validacionStatus ?? f.properties.status)}</p>
                <Link href="/validation" className="text-sky-700 underline">
                  Ir a validación
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
