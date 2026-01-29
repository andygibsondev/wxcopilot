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

      // Custom pin marker icon (SVG) - 50% size
      const pinSvg = `<svg width="25" height="41" viewBox="0 0 50 82" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M25 0C11.1929 0 0 11.1929 0 25C0 43.75 25 82 25 82C25 82 50 43.75 50 25C50 11.1929 38.8071 0 25 0ZM25 37.5C18.0964 37.5 12.5 31.9036 12.5 25C12.5 18.0964 18.0964 12.5 25 12.5C31.9036 12.5 37.5 18.0964 37.5 25C37.5 31.9036 31.9036 37.5 25 37.5Z" fill="#2A71B0"/>
  <circle cx="25" cy="25" r="9" fill="white"/>
</svg>`;
      const pinIcon = L.default.divIcon({
        html: pinSvg,
        className: 'airfield-map-pin-icon',
        iconSize: [25, 41],
        iconAnchor: [12.5, 41],
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

        // Add marker with custom pin icon (no popup label)
        markerRef.current = L.default.marker([latitude, longitude], { icon: pinIcon })
          .addTo(mapRef.current);
      } else {
        // Update map center and marker position if coordinates change
        mapRef.current.setView([latitude, longitude], 14);
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
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
  }, [isClient, latitude, longitude]);

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
        :global(.airfield-map-pin-icon) {
          background: none !important;
          border: none !important;
        }
        :global(.airfield-map-pin-icon svg) {
          display: block;
        }
      `}</style>
    </div>
  );
};
