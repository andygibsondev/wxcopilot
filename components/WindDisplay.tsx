'use client';

import React from 'react';

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

  // Wind direction indicates where wind is COMING FROM
  // Arrow should point in the direction wind is GOING (add 180°)
  const windGoingDirection = (direction + 180) % 360;

  return (
    <div className="wind-display">
      {/* Wind Direction Compass - Full Width */}
      <div className="wind-compass-card">
        <div className="weather-card-header">
          <span className="weather-icon">🧭</span>
          <h3>Wind Direction</h3>
        </div>
        <div className="compass-container">
          <div className="compass">
            {/* Compass rose background */}
            <div className="compass-rose">
              <span className="compass-point north">N</span>
              <span className="compass-point east">E</span>
              <span className="compass-point south">S</span>
              <span className="compass-point west">W</span>
              {/* Tick marks */}
              {[...Array(36)].map((_, i) => (
                <div
                  key={i}
                  className={`tick ${i % 9 === 0 ? 'major' : i % 3 === 0 ? 'minor' : 'small'}`}
                  style={{ transform: `rotate(${i * 10}deg)` }}
                />
              ))}
            </div>
            {/* Wind arrow - points where wind is going */}
            <div
              className="wind-arrow"
              style={{ transform: `rotate(${windGoingDirection}deg)` }}
            >
              <svg viewBox="0 0 30 75" className="arrow-svg" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#0891b2" />
                    <stop offset="100%" stopColor="#0e7490" />
                  </linearGradient>
                  <filter id="arrowShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3"/>
                  </filter>
                </defs>
                {/* Arrow shape - pointing up */}
                <path
                  d="M15 0 L30 22 L19 18 L19 75 L11 75 L11 18 L0 22 Z"
                  fill="url(#arrowGradient)"
                  filter="url(#arrowShadow)"
                />
              </svg>
            </div>
            {/* Center circle */}
            <div className="compass-center">
              <span className="direction-text">{compassDirection}</span>
              <span className="degrees-text">{Math.round(direction)}°</span>
            </div>
          </div>
          <div className="wind-labels">
            <div className="wind-label from">
              <span className="label-title">From</span>
              <span className="label-value">{compassDirection}</span>
            </div>
            <div className="wind-label to">
              <span className="label-title">Going</span>
              <span className="label-value">{directions[(directionIndex + 8) % 16]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wind Speed Card */}
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

      {/* Wind Gusts Card */}
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

        .wind-compass-card,
        .wind-speed-card,
        .wind-gusts-card {
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%);
          border-radius: 16px;
          padding: 1rem;
          border: 1px solid rgba(0, 0, 0, 0.04);
          position: relative;
          overflow: hidden;
          transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .wind-compass-card::before,
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

        .wind-compass-card:hover::before,
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

        /* Compass Styles */
        .compass-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .compass {
          position: relative;
          width: 180px;
          height: 180px;
        }

        .compass-rose {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          box-shadow: 
            inset 0 2px 10px rgba(0, 0, 0, 0.1),
            0 4px 20px rgba(0, 0, 0, 0.1);
          border: 3px solid #cbd5e1;
        }

        .compass-point {
          position: absolute;
          font-size: 0.75rem;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
        }

        .compass-point.north {
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          color: #dc2626;
        }

        .compass-point.south {
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
        }

        .compass-point.east {
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
        }

        .compass-point.west {
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
        }

        .tick {
          position: absolute;
          top: 6px;
          left: 50%;
          width: 2px;
          transform-origin: 0 84px;
        }

        .tick::after {
          content: '';
          display: block;
          width: 2px;
          background: #94a3b8;
        }

        .tick.major::after {
          height: 12px;
          background: #475569;
          width: 3px;
          margin-left: -0.5px;
        }

        .tick.minor::after {
          height: 8px;
          background: #64748b;
        }

        .tick.small::after {
          height: 4px;
          background: #cbd5e1;
        }

        .wind-arrow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 30px;
          height: 75px;
          margin-left: -15px;
          margin-top: -75px;
          transform-origin: center bottom;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
          z-index: 5;
        }

        .arrow-svg {
          width: 100%;
          height: 100%;
        }

        .compass-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .direction-text {
          font-size: 0.875rem;
          font-weight: 800;
          color: #1e293b;
          line-height: 1;
        }

        .degrees-text {
          font-size: 0.625rem;
          font-weight: 600;
          color: #64748b;
          line-height: 1;
          margin-top: 2px;
        }

        .wind-labels {
          display: flex;
          gap: 2rem;
          justify-content: center;
        }

        .wind-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .label-title {
          font-size: 0.625rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .label-value {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
        }

        .wind-label.from .label-value {
          color: #dc2626;
        }

        .wind-label.to .label-value {
          color: #06b6d4;
        }

        /* Wind Speed Styles */
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
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .wind-compass-card {
            grid-column: 1 / -1;
          }

          .compass {
            width: 220px;
            height: 220px;
          }

          .tick {
            transform-origin: 0 104px;
            top: 6px;
          }

          .compass-center {
            width: 70px;
            height: 70px;
          }

          .direction-text {
            font-size: 1rem;
          }

          .degrees-text {
            font-size: 0.75rem;
          }

          .compass-point {
            font-size: 0.875rem;
          }

          .compass-point.north {
            top: 10px;
          }

          .compass-point.south {
            bottom: 10px;
          }

          .compass-point.east {
            right: 10px;
          }

          .compass-point.west {
            left: 10px;
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

