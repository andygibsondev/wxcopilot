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
        /* Mobile-first grid */
        .wind-display {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.875rem;
        }
        .wind-speed-card,
        .wind-gusts-card {
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%);
          border-radius: 16px;
          padding: 1rem;
          border: 1px solid rgba(0, 0, 0, 0.04);
          position: relative;
          overflow: hidden;
          transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .wind-speed-card::before,
        .wind-gusts-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%);
          opacity: 0;
          transition: opacity 150ms;
        }
        .wind-speed-card:hover::before,
        .wind-gusts-card:hover::before {
          opacity: 1;
        }
        .weather-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.625rem;
        }
        .weather-card-header h3 {
          font-size: 0.6875rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .weather-icon {
          font-size: 1.125rem;
          filter: saturate(1.2);
        }
        .wind-speed-values {
          display: flex;
          align-items: baseline;
          gap: 1rem;
        }
        .wind-speed-primary {
          display: flex;
          align-items: baseline;
          gap: 0.375rem;
        }
        .wind-speed-primary .value {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.02em;
        }
        .wind-speed-primary .unit {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 600;
        }
        .wind-speed-secondary {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
          padding-left: 1rem;
          border-left: 2px solid rgba(0, 0, 0, 0.08);
        }
        .wind-speed-secondary .value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #64748b;
        }
        .wind-speed-secondary .unit {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 600;
        }
        
        /* Tablet and up */
        @media (min-width: 768px) {
          .wind-display {
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }
          .wind-speed-card,
          .wind-gusts-card {
            padding: 1.25rem;
            border-radius: 20px;
          }
          .weather-card-header h3 {
            font-size: 0.75rem;
          }
          .weather-icon {
            font-size: 1.375rem;
          }
          .wind-speed-primary .value {
            font-size: 2rem;
          }
          .wind-speed-primary .unit {
            font-size: 1rem;
          }
          .wind-speed-secondary .value {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

