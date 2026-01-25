'use client';

import React from 'react';

interface WeatherCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: string;
  className?: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  title,
  value,
  unit,
  icon,
  className = '',
}) => {
  return (
    <div className={`weather-card ${className}`}>
      {icon && (
        <div className="weather-icon-wrapper">
          <span className="weather-icon">{icon}</span>
        </div>
      )}
      <div className="weather-card-value">
        <span className="value">{value}</span>
        {unit && <span className="unit">{unit}</span>}
      </div>
      <h3 className="weather-card-title">{title}</h3>
      <style jsx>{`
        .weather-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 1.125rem;
          border: 1px solid rgba(0, 0, 0, 0.08);
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          width: 100%;
          box-sizing: border-box;
        }
        .weather-card.primary-card {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%);
          border-color: rgba(139, 92, 246, 0.25);
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.15);
        }
        .weather-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%);
          opacity: 0;
          transition: opacity 200ms;
        }
        .weather-card:active {
          transform: scale(0.98);
        }
        .weather-icon-wrapper {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin: 0 auto 0.875rem;
        }
        .weather-icon {
          font-size: 1.5rem;
          filter: saturate(1.2);
          line-height: 1;
        }
        .weather-card-value {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 0.375rem;
          flex-wrap: wrap;
          margin-bottom: 0.625rem;
        }
        .weather-card-title {
          font-size: 0.6875rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
          text-align: center;
          line-height: 1.3;
        }
        .value {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1e293b;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .unit {
          font-size: 0.9375rem;
          color: #64748b;
          font-weight: 600;
        }
        
        /* Mobile adjustments */
        @media (max-width: 640px) {
          .weather-card {
            padding: 1rem 0.875rem;
          }
          .weather-icon-wrapper {
            width: 44px;
            height: 44px;
            margin-bottom: 0.75rem;
          }
          .weather-icon {
            font-size: 1.375rem;
          }
          .value {
            font-size: 1.75rem;
          }
          .unit {
            font-size: 0.875rem;
          }
          .weather-card-title {
            font-size: 0.625rem;
          }
        }

        /* Tablet and up */
        @media (min-width: 768px) {
          .weather-card {
            padding: 1.5rem 1.25rem;
            border-radius: 20px;
          }
          .weather-icon-wrapper {
            width: 56px;
            height: 56px;
            margin-bottom: 1rem;
          }
          .weather-icon {
            font-size: 1.75rem;
          }
          .weather-card-title {
            font-size: 0.75rem;
          }
          .value {
            font-size: 2.25rem;
          }
          .unit {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

