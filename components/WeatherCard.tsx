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
      <div className="weather-card-header">
        {icon && <span className="weather-icon">{icon}</span>}
        <h3>{title}</h3>
      </div>
      <div className="weather-card-value">
        <span className="value">{value}</span>
        {unit && <span className="unit">{unit}</span>}
      </div>
      <style jsx>{`
        .weather-card {
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%);
          border-radius: 16px;
          padding: 1rem;
          border: 1px solid rgba(0, 0, 0, 0.04);
          transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
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
          transition: opacity 150ms;
        }
        .weather-card:hover::before {
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
        .weather-card-value {
          display: flex;
          align-items: baseline;
          gap: 0.375rem;
          flex-wrap: wrap;
        }
        .value {
          font-size: 1.625rem;
          font-weight: 800;
          color: #1e293b;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .unit {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 600;
        }
        
        /* Tablet and up */
        @media (min-width: 768px) {
          .weather-card {
            padding: 1.25rem;
            border-radius: 20px;
          }
          .weather-card-header h3 {
            font-size: 0.75rem;
          }
          .weather-icon {
            font-size: 1.375rem;
          }
          .value {
            font-size: 2rem;
          }
          .unit {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

