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
        <div className="compass-container">
          <div className="compass">
            {/* Modern compass rose */}
            <div className="compass-rose">
              {/* Cardinal directions */}
              <div className="compass-cardinal north">
                <span className="cardinal-label">N</span>
                <div className="cardinal-line"></div>
              </div>
              <div className="compass-cardinal east">
                <span className="cardinal-label">E</span>
                <div className="cardinal-line"></div>
              </div>
              <div className="compass-cardinal south">
                <span className="cardinal-label">S</span>
                <div className="cardinal-line"></div>
              </div>
              <div className="compass-cardinal west">
                <span className="cardinal-label">W</span>
                <div className="cardinal-line"></div>
              </div>
              
              {/* Intercardinal directions */}
              <div className="compass-intercardinal ne" style={{ transform: 'rotate(45deg)' }}>
                <span className="intercardinal-label">NE</span>
              </div>
              <div className="compass-intercardinal se" style={{ transform: 'rotate(135deg)' }}>
                <span className="intercardinal-label">SE</span>
              </div>
              <div className="compass-intercardinal sw" style={{ transform: 'rotate(225deg)' }}>
                <span className="intercardinal-label">SW</span>
              </div>
              <div className="compass-intercardinal nw" style={{ transform: 'rotate(315deg)' }}>
                <span className="intercardinal-label">NW</span>
              </div>
              
              {/* Modern tick marks */}
              {[...Array(72)].map((_, i) => {
                const isMajor = i % 18 === 0;
                const isMinor = i % 9 === 0;
                return (
                  <div
                    key={i}
                    className={`compass-tick ${isMajor ? 'major' : isMinor ? 'minor' : ''}`}
                    style={{ transform: `rotate(${i * 5}deg)` }}
                  />
                );
              })}
            </div>
            
            {/* Modern wind arrow */}
            <div
              className="wind-arrow"
              style={{ transform: `rotate(${windGoingDirection}deg)` }}
            >
              <svg viewBox="0 0 100 100" className="arrow-svg" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="arrowGradient" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#1e40af" />
                  </linearGradient>
                  <filter id="arrowGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {/* Modern arrow shape */}
                <path
                  d="M50 10 L65 45 L58 45 L58 90 L42 90 L42 45 L35 45 Z"
                  fill="url(#arrowGradient)"
                  filter="url(#arrowGlow)"
                  stroke="#1e40af"
                  strokeWidth="1"
                />
                {/* Arrow tail */}
                <circle cx="50" cy="50" r="4" fill="url(#arrowGradient)" />
              </svg>
            </div>
            
            {/* Modern center display */}
            <div className="compass-center">
              <div className="center-content">
                <span className="direction-text">{compassDirection}</span>
                <span className="degrees-text">{Math.round(direction)}°</span>
              </div>
            </div>
          </div>
          
          {/* Modern info display */}
          <div className="wind-info">
            <div className="wind-info-item">
              <span className="info-label">From</span>
              <span className="info-value">{compassDirection}</span>
            </div>
            <div className="wind-info-divider"></div>
            <div className="wind-info-item">
              <span className="info-label">To</span>
              <span className="info-value">{directions[(directionIndex + 8) % 16]}</span>
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

        .wind-compass-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid rgba(226, 232, 240, 0.8);
          position: relative;
          overflow: hidden;
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        }

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

        /* Modern Compass Styles */
        .compass-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }

        .compass {
          position: relative;
          width: 200px;
          height: 200px;
        }

        .compass-rose {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
          box-shadow: 
            inset 0 0 0 2px rgba(226, 232, 240, 0.8),
            0 8px 32px rgba(0, 0, 0, 0.08),
            0 2px 8px rgba(0, 0, 0, 0.04);
          border: 2px solid rgba(226, 232, 240, 0.6);
        }

        .compass-cardinal {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
        }

        .compass-cardinal.north {
          top: 4px;
          left: 50%;
          transform: translateX(-50%);
        }

        .compass-cardinal.south {
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
        }

        .compass-cardinal.east {
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
        }

        .compass-cardinal.west {
          left: 4px;
          top: 50%;
          transform: translateY(-50%);
        }

        .cardinal-label {
          font-size: 0.875rem;
          font-weight: 800;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .compass-cardinal.north .cardinal-label {
          color: #dc2626;
        }

        .cardinal-line {
          width: 2px;
          height: 16px;
          background: linear-gradient(180deg, #1e293b 0%, transparent 100%);
        }

        .compass-cardinal.south .cardinal-line {
          background: linear-gradient(0deg, #1e293b 0%, transparent 100%);
        }

        .compass-cardinal.east .cardinal-line,
        .compass-cardinal.west .cardinal-line {
          width: 16px;
          height: 2px;
          background: linear-gradient(90deg, #1e293b 0%, transparent 100%);
        }

        .compass-cardinal.west .cardinal-line {
          background: linear-gradient(270deg, #1e293b 0%, transparent 100%);
        }

        .compass-intercardinal {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: 0 0;
          width: 100px;
          height: 2px;
        }

        .intercardinal-label {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.625rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: rgba(255, 255, 255, 0.9);
          padding: 0 0.25rem;
          border-radius: 4px;
        }

        .compass-tick {
          position: absolute;
          top: 8px;
          left: 50%;
          width: 1px;
          transform-origin: 0 92px;
        }

        .compass-tick::after {
          content: '';
          display: block;
          width: 1px;
          height: 6px;
          background: #cbd5e1;
        }

        .compass-tick.major::after {
          height: 12px;
          background: #64748b;
          width: 2px;
          margin-left: -0.5px;
        }

        .compass-tick.minor::after {
          height: 8px;
          background: #94a3b8;
        }

        .wind-arrow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 40px;
          height: 80px;
          margin-left: -20px;
          margin-top: -80px;
          transform-origin: center bottom;
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
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
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.12),
            inset 0 1px 2px rgba(255, 255, 255, 0.8);
          border: 2px solid rgba(226, 232, 240, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .center-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.125rem;
        }

        .direction-text {
          font-size: 1rem;
          font-weight: 800;
          color: #1e293b;
          line-height: 1;
          letter-spacing: 0.02em;
        }

        .degrees-text {
          font-size: 0.6875rem;
          font-weight: 600;
          color: #64748b;
          line-height: 1;
        }

        .wind-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1.25rem;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 12px;
          border: 1px solid rgba(226, 232, 240, 0.8);
        }

        .wind-info-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .info-label {
          font-size: 0.625rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .info-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: 0.02em;
        }

        .wind-info-divider {
          width: 1px;
          height: 32px;
          background: linear-gradient(180deg, transparent 0%, #e2e8f0 50%, transparent 100%);
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
        
        /* Mobile adjustments */
        @media (max-width: 640px) {
          .wind-compass-card {
            padding: 1.25rem;
          }
          .compass {
            width: 180px;
            height: 180px;
          }
          .compass-tick {
            transform-origin: 0 82px;
          }
          .compass-center {
            width: 64px;
            height: 64px;
          }
          .direction-text {
            font-size: 0.875rem;
          }
          .degrees-text {
            font-size: 0.625rem;
          }
          .cardinal-label {
            font-size: 0.75rem;
          }
          .wind-arrow {
            width: 36px;
            height: 72px;
            margin-left: -18px;
            margin-top: -72px;
          }
          .wind-info {
            padding: 0.75rem 1rem;
            gap: 0.875rem;
          }
          .info-value {
            font-size: 1rem;
          }
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
            width: 240px;
            height: 240px;
          }

          .compass-tick {
            transform-origin: 0 112px;
            top: 8px;
          }

          .compass-center {
            width: 80px;
            height: 80px;
          }

          .direction-text {
            font-size: 1.125rem;
          }

          .degrees-text {
            font-size: 0.75rem;
          }

          .cardinal-label {
            font-size: 1rem;
          }

          .compass-cardinal.north {
            top: 6px;
          }

          .compass-cardinal.south {
            bottom: 6px;
          }

          .compass-cardinal.east {
            right: 6px;
          }

          .compass-cardinal.west {
            left: 6px;
          }

          .wind-arrow {
            width: 48px;
            height: 96px;
            margin-left: -24px;
            margin-top: -96px;
          }

          .info-value {
            font-size: 1.25rem;
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

