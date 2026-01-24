'use client';

import React from 'react';
import { WeatherCard } from './WeatherCard';

interface WindDisplayProps {
  speed: number;
  direction: number;
  gusts?: number;
}

export const WindDisplay: React.FC<WindDisplayProps> = ({
  speed,
  direction,
  gusts,
}) => {
  // Convert wind direction to compass direction
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const directionIndex = Math.round(direction / 22.5) % 16;
  const compassDirection = directions[directionIndex];

  // UK Met Office API returns wind speed in km/h
  // Convert km/h to knots: 1 km/h = 0.539957 knots
  // Convert km/h to mph: 1 km/h = 0.621371 mph
  const speedKnots = speed * 0.539957;
  const speedMph = speed * 0.621371;
  const speedKnotsFormatted = speedKnots.toFixed(0);
  const speedMphFormatted = speedMph.toFixed(0);
  
  // Convert gusts (also in km/h)
  let gustsKnots: number | null = null;
  let gustsMph: number | null = null;
  if (gusts) {
    gustsKnots = gusts * 0.539957;
    gustsMph = gusts * 0.621371;
  }

  return (
    <div className="wind-display">
      <div className="wind-speed-card">
        <div className="weather-card-header">
          <span className="weather-icon">💨</span>
          <h3>Wind Speed</h3>
        </div>
        <div className="wind-speed-values">
          <div className="wind-speed-primary">
            <span className="value">{speedKnotsFormatted}</span>
            <span className="unit">kts</span>
          </div>
          <div className="wind-speed-secondary">
            <span className="value">{speedMphFormatted}</span>
            <span className="unit">mph</span>
          </div>
        </div>
      </div>
      <WeatherCard
        title="Wind Direction"
        value={`${compassDirection} (${Math.round(direction)}°)`}
        icon="🧭"
      />
      {gusts && (
        <div className="wind-gusts-card">
          <div className="weather-card-header">
            <span className="weather-icon">🌪️</span>
            <h3>Wind Gusts</h3>
          </div>
          <div className="wind-speed-values">
            <div className="wind-speed-primary">
              <span className="value">{gustsKnots!.toFixed(0)}</span>
              <span className="unit">kts</span>
            </div>
            <div className="wind-speed-secondary">
              <span className="value">{gustsMph!.toFixed(0)}</span>
              <span className="unit">mph</span>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .wind-display {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .wind-speed-card,
        .wind-gusts-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .wind-speed-card:hover,
        .wind-gusts-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .weather-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .weather-card-header h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .weather-icon {
          font-size: 1.25rem;
        }
        .wind-speed-values {
          display: flex;
          align-items: baseline;
          gap: 1rem;
        }
        .wind-speed-primary {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }
        .wind-speed-primary .value {
          font-size: 2rem;
          font-weight: 700;
          color: #333;
        }
        .wind-speed-primary .unit {
          font-size: 1rem;
          color: #666;
          font-weight: 500;
        }
        .wind-speed-secondary {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
          padding-left: 1rem;
          border-left: 2px solid #e5e7eb;
        }
        .wind-speed-secondary .value {
          font-size: 1.5rem;
          font-weight: 600;
          color: #666;
        }
        .wind-speed-secondary .unit {
          font-size: 0.875rem;
          color: #999;
          font-weight: 500;
        }
        @media (max-width: 640px) {
          .wind-speed-values {
            flex-direction: column;
            gap: 0.5rem;
          }
          .wind-speed-secondary {
            padding-left: 0;
            border-left: none;
            padding-top: 0.5rem;
            border-top: 2px solid #e5e7eb;
          }
        }
      `}</style>
    </div>
  );
};

