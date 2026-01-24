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
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .weather-card:hover {
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
        .weather-card-value {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }
        .value {
          font-size: 2rem;
          font-weight: 700;
          color: #333;
        }
        .unit {
          font-size: 1rem;
          color: #666;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

