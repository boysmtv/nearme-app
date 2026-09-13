import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Provider {
  id: string;
  name: string;
  slug?: string;
  lat?: number;
  lng?: number;
  category?: string;
  rating?: number;
  distance?: number;
}

interface LeafletMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  providers?: Provider[];
  radius?: number;
  onProviderClick?: (provider: Provider) => void;
  className?: string;
}

function createProviderIcon(category?: string): L.DivIcon {
  const colorMap: Record<string, string> = {
    Barbershop: '#3b82f6',
    Salon: '#ec4899',
    Kecantikan: '#a855f7',
    Spa: '#14b8a6',
  };
  const color = colorMap[category || ''] || '#6C63FF';

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width:32px;height:32px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);color:white;font-size:14px;font-weight:bold;">&#9733;</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export default function LeafletMap({
  center,
  zoom = 14,
  providers = [],
  radius = 5,
  onProviderClick,
  className = '',
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // User location marker
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `<div style="
        width:20px;height:20px;border-radius:50%;
        background:#ef4444;border:3px solid white;
        box-shadow:0 0 0 3px rgba(239,68,68,0.3), 0 2px 6px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    L.marker([center.lat, center.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('Lokasi Anda');

    // Radius circle
    L.circle([center.lat, center.lng], {
      radius: radius * 1000,
      color: '#6C63FF',
      fillColor: '#6C63FF',
      fillOpacity: 0.08,
      weight: 2,
      dashArray: '8 4',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map center when location changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.lat, center.lng], zoom);
    }
  }, [center.lat, center.lng, zoom]);

  // Update markers when providers change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    providers.forEach((p) => {
      if (p.lat == null || p.lng == null) return;

      const marker = L.marker([p.lat, p.lng], {
        icon: createProviderIcon(p.category),
      }).addTo(map);

      const popupHtml = `
        <div style="min-width:160px;font-family:system-ui,sans-serif;">
          <div style="font-weight:600;font-size:14px;margin-bottom:4px;">${p.name}</div>
          ${p.category ? `<div style="font-size:12px;color:#666;margin-bottom:4px;">${p.category}</div>` : ''}
          ${p.rating ? `<div style="font-size:12px;color:#f59e0b;">&#9733; ${p.rating.toFixed(1)}</div>` : ''}
          ${p.distance != null ? `<div style="font-size:12px;color:#6C63FF;margin-top:2px;">${typeof p.distance === 'number' ? p.distance.toFixed(1) + ' km' : p.distance}</div>` : ''}
        </div>
      `;

      marker.bindPopup(popupHtml);

      if (onProviderClick) {
        marker.on('click', () => onProviderClick(p));
      }

      markersRef.current.push(marker);
    });
  }, [providers, onProviderClick]);

  return <div ref={mapRef} className={`w-full h-full ${className}`} />;
}
