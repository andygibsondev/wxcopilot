'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AirfieldMapProps {
  latitude: number;
  longitude: number;
  name: string;
  icao?: string;
}

export const AirfieldMap: React.FC<AirfieldMapProps> = ({
  latitude,
  longitude,
  name,
  icao,
}) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || typeof window === 'undefined' || !mapContainerRef.current) return;

    // Dynamically import Leaflet only on client side
    import('leaflet').then((L) => {
      if (!mapContainerRef.current) return;

      // Fix for default icon path issue
      delete (L.default.Icon.Default.prototype as any)._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Initialize map if not already created
      if (!mapRef.current) {
        mapRef.current = L.default.map(mapContainerRef.current, {
          center: [latitude, longitude],
          zoom: 14,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
          keyboard: true,
          dragging: true,
          touchZoom: true,
        });

        // Add OpenStreetMap tile layer
        L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);

        // Add marker
        markerRef.current = L.default.marker([latitude, longitude])
          .addTo(mapRef.current)
          .bindPopup(`<strong>${name}</strong>${icao ? `<br>${icao}` : ''}`)
          .openPopup();
      } else {
        // Update map center and marker position if coordinates change
        mapRef.current.setView([latitude, longitude], 14);
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
          markerRef.current.setPopupContent(`<strong>${name}</strong>${icao ? `<br>${icao}` : ''}`);
        }
      }
    });

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isClient, latitude, longitude, name, icao]);

  if (!isClient) {
    return (
      <div className="airfield-map-container">
        <div className="airfield-map-leaflet" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', height: '300px', borderRadius: '12px' }}>
          <span style={{ color: '#64748b' }}>Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="airfield-map-container">
      <div ref={mapContainerRef} className="airfield-map-leaflet" />
      <style jsx>{`
        .airfield-map-container {
          width: 100%;
          margin-bottom: 1rem;
        }
        .airfield-map-leaflet {
          width: 100%;
          height: 300px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        :global(.leaflet-container) {
          background: #f8fafc;
        }
        :global(.leaflet-popup-content-wrapper) {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        :global(.leaflet-popup-content) {
          margin: 12px 16px;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        :global(.leaflet-popup-content strong) {
          color: #1e293b;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};
