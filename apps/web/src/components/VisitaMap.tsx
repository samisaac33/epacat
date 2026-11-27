'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeoJsonFeatureCollection } from '@epacat/shared';
import Link from 'next/link';
import { MANABI_MAP_CENTER, MANABI_MAP_ZOOM } from '@/lib/manabi-bbox';

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

function FitAllMarkers({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [48, 48], maxZoom: 11 });
  }, [map, positions]);
  return null;
}

export function VisitaMap({ data }: Props) {
  const positions: [number, number][] = data.features.map((f) => [
    f.geometry.coordinates[1],
    f.geometry.coordinates[0],
  ]);

  return (
    <MapContainer
      center={MANABI_MAP_CENTER}
      zoom={MANABI_MAP_ZOOM}
      className="h-[min(70vh,600px)] w-full rounded-lg"
    >
      <FitAllMarkers positions={positions} />
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
