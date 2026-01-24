'use client';

import React from 'react';
import { WeatherCard } from './WeatherCard';

interface CloudBaseDisplayProps {
  cloudCover: number;
  cloudCoverLow: number;
  cloudCoverMid: number;
  cloudCoverHigh: number;
  temperature: number;
  humidity: number;
}

export const CloudBaseDisplay: React.FC<CloudBaseDisplayProps> = ({
  cloudCover,
  cloudCoverLow,
  cloudCoverMid,
  cloudCoverHigh,
  temperature,
  humidity,
}) => {
  // Estimate cloud base using temperature and humidity
  // Simplified formula: Cloud base (ft) = (Temperature - Dew Point) * 400
  // Dew point approximation: Td = T - ((100 - RH) / 5)
  const dewPoint = temperature - ((100 - humidity) / 5);
  const cloudBaseFeet = Math.max(0, (temperature - dewPoint) * 400);
  const cloudBaseFeetRounded = Math.round(cloudBaseFeet);

  // Convert to meters for display
  const cloudBaseMeters = Math.round(cloudBaseFeet * 0.3048);

  // Determine cloud conditions
  const getCloudCondition = () => {
    if (cloudCover < 25) return { text: 'Clear', emoji: '☀️', color: '#10b981' };
    if (cloudCover < 50) return { text: 'Few Clouds', emoji: '🌤️', color: '#3b82f6' };
    if (cloudCover < 75) return { text: 'Scattered', emoji: '⛅', color: '#f59e0b' };
    if (cloudCover < 90) return { text: 'Broken', emoji: '☁️', color: '#ef4444' };
    return { text: 'Overcast', emoji: '🌫️', color: '#6b7280' };
  };

  const cloudCondition = getCloudCondition();

  return (
    <div className="cloud-display">
      <WeatherCard
        title="Cloud Base"
        value={cloudBaseFeetRounded > 0 ? cloudBaseFeetRounded : 'N/A'}
        unit={cloudBaseFeetRounded > 0 ? 'ft' : ''}
        icon="☁️"
      />
      <WeatherCard
        title="Cloud Cover"
        value={`${Math.round(cloudCover)}%`}
        icon={cloudCondition.emoji}
      />
      <WeatherCard
        title="Cloud Condition"
        value={cloudCondition.text}
        icon={cloudCondition.emoji}
      />
      <div className="cloud-details">
        <div className="cloud-detail-item">
          <span>Low:</span> <strong>{Math.round(cloudCoverLow)}%</strong>
        </div>
        <div className="cloud-detail-item">
          <span>Mid:</span> <strong>{Math.round(cloudCoverMid)}%</strong>
        </div>
        <div className="cloud-detail-item">
          <span>High:</span> <strong>{Math.round(cloudCoverHigh)}%</strong>
        </div>
      </div>
      <style jsx>{`
        .cloud-display {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .cloud-details {
          grid-column: 1 / -1;
          background: white;
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          justify-content: space-around;
          gap: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .cloud-detail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        .cloud-detail-item span {
          font-size: 0.75rem;
          color: #666;
          text-transform: uppercase;
        }
        .cloud-detail-item strong {
          font-size: 1.25rem;
          color: #333;
        }
        @media (max-width: 640px) {
          .cloud-details {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

