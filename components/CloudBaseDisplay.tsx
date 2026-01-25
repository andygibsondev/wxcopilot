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
      <div className="cloud-layers-section">
        <div className="cloud-layers-description">
          <p>Cloud cover is measured at different altitude layers. Low clouds affect surface visibility and approach procedures, mid clouds impact en-route flight, and high clouds indicate upper-level weather patterns.</p>
        </div>
        <div className="cloud-details">
          <div className="cloud-detail-item">
            <span>Low:</span> <strong>{Math.round(cloudCoverLow)}%</strong>
            <span className="cloud-description">Surface - 6,500 ft</span>
          </div>
          <div className="cloud-detail-item">
            <span>Mid:</span> <strong>{Math.round(cloudCoverMid)}%</strong>
            <span className="cloud-description">6,500 - 20,000 ft</span>
          </div>
          <div className="cloud-detail-item">
            <span>High:</span> <strong>{Math.round(cloudCoverHigh)}%</strong>
            <span className="cloud-description">Above 20,000 ft</span>
          </div>
        </div>
      </div>
      <style jsx>{`
        .cloud-display {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.875rem;
        }
        .cloud-layers-section {
          grid-column: 1 / -1;
        }
        .cloud-layers-description {
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
          border-left: 4px solid var(--color-accent, #06b6d4);
        }
        .cloud-layers-description p {
          font-size: 0.8125rem;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }
        .cloud-details {
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          justify-content: space-around;
          gap: 1rem;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }
        .cloud-detail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.375rem;
        }
        .cloud-detail-item span:first-of-type {
          font-size: 0.6875rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.06em;
        }
        .cloud-detail-item strong {
          font-size: 1.375rem;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.02em;
        }
        .cloud-description {
          font-size: 0.625rem;
          color: #94a3b8;
          font-weight: 500;
          text-transform: none;
          letter-spacing: 0;
          margin-top: 0.125rem;
          text-align: center;
          line-height: 1.3;
        }
        @media (max-width: 640px) {
          .cloud-layers-description {
            padding: 0.875rem;
          }
          .cloud-layers-description p {
            font-size: 0.75rem;
          }
          .cloud-details {
            flex-direction: row;
            gap: 0.75rem;
            padding: 1rem;
          }
        }
        @media (min-width: 768px) {
          .cloud-display {
            gap: 1rem;
          }
          .cloud-layers-description {
            padding: 1.25rem;
          }
          .cloud-layers-description p {
            font-size: 0.875rem;
          }
          .cloud-details {
            border-radius: 20px;
            padding: 1.5rem;
          }
          .cloud-detail-item strong {
            font-size: 1.5rem;
          }
          .cloud-description {
            font-size: 0.6875rem;
          }
        }
      `}</style>
    </div>
  );
};

