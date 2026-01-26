'use client';

import React, { useState } from 'react';

export type AircraftType = 'light' | 'microlight' | 'jet';

/**
 * Aircraft Operating Minimums
 * 
 * These are suggested VFR operating minimums for different aircraft types.
 * Always consult your aircraft POH and apply pilot-in-command judgement.
 * 
 * Values are:
 * - windGood/windMarginal: Wind speed limits in knots
 * - visGood/visMarginal: Visibility limits in meters
 * - cloudBaseGood/cloudBaseMarginal: Cloud base limits in feet AGL
 * - cloudCoverGood/cloudCoverMarginal: Cloud cover limits in percentage
 * - precipGood/precipMarginal: Precipitation limits in mm/hr
 */
const AIRCRAFT_LIMITS = {
  jet: {
    name: 'Big Jet',
    icon: '✈️',
    description: 'Commercial jets and large turboprops',
    windGood: 35,        // Strong aircraft, higher wind tolerance
    windMarginal: 45,
    visGood: 5000,       // 5km minimum for VFR
    visMarginal: 3000,
    cloudBaseGood: 500,  // Lower cloud base acceptable with IFR capability
    cloudBaseMarginal: 300,
    cloudCoverGood: 75,  // More tolerant of cloud cover
    cloudCoverMarginal: 90,
    precipGood: 0,
    precipMarginal: 5,   // Can handle moderate rain
  },
  light: {
    name: 'Light Aircraft',
    icon: '🛩️',
    description: 'Single/multi-engine piston aircraft (Cessna, Piper, etc.)',
    windGood: 20,        // Typical light aircraft crosswind limit ~15-20 kts
    windMarginal: 30,
    visGood: 5000,       // 5km VFR minimum
    visMarginal: 3000,
    cloudBaseGood: 1000, // Need 1000ft clearance below cloud
    cloudBaseMarginal: 500,
    cloudCoverGood: 50,  // Prefer clearer skies
    cloudCoverMarginal: 75,
    precipGood: 0,
    precipMarginal: 2,   // Light rain only
  },
  microlight: {
    name: 'Microlight',
    icon: '🛫',
    description: 'Microlights, ultralights, and flex-wing aircraft',
    windGood: 12,        // Very sensitive to wind
    windMarginal: 18,    // Max safe wind for most microlights
    visGood: 8000,       // Need excellent visibility
    visMarginal: 5000,
    cloudBaseGood: 1500, // Need higher cloud base for safe operations
    cloudBaseMarginal: 1000,
    cloudCoverGood: 40,  // Prefer clear skies
    cloudCoverMarginal: 60,
    precipGood: 0,       // No precipitation
    precipMarginal: 0.5, // Very light drizzle max
  },
};

const AIRCRAFT_LABELS: Record<AircraftType, string> = {
  jet: 'Big Jet',
  light: 'Light Aircraft',
  microlight: 'Microlight',
};

// Minimums Panel Component
interface MinimumsPanelProps {
  aircraftType: AircraftType;
  limits: typeof AIRCRAFT_LIMITS[AircraftType];
}

const MinimumsPanel: React.FC<MinimumsPanelProps> = ({ aircraftType, limits }) => {
  const [isOpen, setIsOpen] = useState(false);
  const aircraft = AIRCRAFT_LIMITS[aircraftType];

  return (
    <div className="minimums-panel">
      <button 
        className="minimums-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="minimums-toggle-icon">{aircraft.icon}</span>
        <span className="minimums-toggle-text">
          {aircraft.name} Operating Minimums
        </span>
        <span className="minimums-toggle-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className="minimums-content">
          <p className="minimums-description">{aircraft.description}</p>
          
          {/* Desktop Table View */}
          <table className="minimums-table desktop-only">
            <thead>
              <tr>
                <th>Condition</th>
                <th>Good</th>
                <th>Marginal</th>
                <th>Poor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Wind Speed</strong></td>
                <td className="good">&lt; {limits.windGood} kts</td>
                <td className="marginal">{limits.windGood}-{limits.windMarginal} kts</td>
                <td className="poor">&gt; {limits.windMarginal} kts</td>
              </tr>
              <tr>
                <td><strong>Visibility</strong></td>
                <td className="good">&gt; {limits.visGood / 1000} km</td>
                <td className="marginal">{limits.visMarginal / 1000}-{limits.visGood / 1000} km</td>
                <td className="poor">&lt; {limits.visMarginal / 1000} km</td>
              </tr>
              <tr>
                <td><strong>Cloud Base</strong></td>
                <td className="good">&gt; {limits.cloudBaseGood} ft</td>
                <td className="marginal">{limits.cloudBaseMarginal}-{limits.cloudBaseGood} ft</td>
                <td className="poor">&lt; {limits.cloudBaseMarginal} ft</td>
              </tr>
              <tr>
                <td><strong>Cloud Cover</strong></td>
                <td className="good">&lt; {limits.cloudCoverGood}%</td>
                <td className="marginal">{limits.cloudCoverGood}-{limits.cloudCoverMarginal}%</td>
                <td className="poor">&gt; {limits.cloudCoverMarginal}%</td>
              </tr>
              <tr>
                <td><strong>Precipitation</strong></td>
                <td className="good">{limits.precipGood === 0 ? 'None' : `< ${limits.precipGood} mm/hr`}</td>
                <td className="marginal">&lt; {limits.precipMarginal} mm/hr</td>
                <td className="poor">&gt; {limits.precipMarginal} mm/hr</td>
              </tr>
            </tbody>
          </table>

          {/* Mobile Card View */}
          <div className="minimums-cards mobile-only">
            <div className="minimums-card">
              <div className="minimums-card-header">💨 Wind Speed</div>
              <div className="minimums-card-values">
                <div className="minimums-value good">
                  <span className="value-label">Good:</span>
                  <span className="value-text">&lt; {limits.windGood} kts</span>
                </div>
                <div className="minimums-value marginal">
                  <span className="value-label">Marginal:</span>
                  <span className="value-text">{limits.windGood}-{limits.windMarginal} kts</span>
                </div>
                <div className="minimums-value poor">
                  <span className="value-label">Poor:</span>
                  <span className="value-text">&gt; {limits.windMarginal} kts</span>
                </div>
              </div>
            </div>

            <div className="minimums-card">
              <div className="minimums-card-header">👁️ Visibility</div>
              <div className="minimums-card-values">
                <div className="minimums-value good">
                  <span className="value-label">Good:</span>
                  <span className="value-text">&gt; {limits.visGood / 1000} km</span>
                </div>
                <div className="minimums-value marginal">
                  <span className="value-label">Marginal:</span>
                  <span className="value-text">{limits.visMarginal / 1000}-{limits.visGood / 1000} km</span>
                </div>
                <div className="minimums-value poor">
                  <span className="value-label">Poor:</span>
                  <span className="value-text">&lt; {limits.visMarginal / 1000} km</span>
                </div>
              </div>
            </div>

            <div className="minimums-card">
              <div className="minimums-card-header">☁️ Cloud Base</div>
              <div className="minimums-card-values">
                <div className="minimums-value good">
                  <span className="value-label">Good:</span>
                  <span className="value-text">&gt; {limits.cloudBaseGood} ft</span>
                </div>
                <div className="minimums-value marginal">
                  <span className="value-label">Marginal:</span>
                  <span className="value-text">{limits.cloudBaseMarginal}-{limits.cloudBaseGood} ft</span>
                </div>
                <div className="minimums-value poor">
                  <span className="value-label">Poor:</span>
                  <span className="value-text">&lt; {limits.cloudBaseMarginal} ft</span>
                </div>
              </div>
            </div>

            <div className="minimums-card">
              <div className="minimums-card-header">🌫️ Cloud Cover</div>
              <div className="minimums-card-values">
                <div className="minimums-value good">
                  <span className="value-label">Good:</span>
                  <span className="value-text">&lt; {limits.cloudCoverGood}%</span>
                </div>
                <div className="minimums-value marginal">
                  <span className="value-label">Marginal:</span>
                  <span className="value-text">{limits.cloudCoverGood}-{limits.cloudCoverMarginal}%</span>
                </div>
                <div className="minimums-value poor">
                  <span className="value-label">Poor:</span>
                  <span className="value-text">&gt; {limits.cloudCoverMarginal}%</span>
                </div>
              </div>
            </div>

            <div className="minimums-card">
              <div className="minimums-card-header">🌧️ Precipitation</div>
              <div className="minimums-card-values">
                <div className="minimums-value good">
                  <span className="value-label">Good:</span>
                  <span className="value-text">{limits.precipGood === 0 ? 'None' : `< ${limits.precipGood} mm/hr`}</span>
                </div>
                <div className="minimums-value marginal">
                  <span className="value-label">Marginal:</span>
                  <span className="value-text">&lt; {limits.precipMarginal} mm/hr</span>
                </div>
                <div className="minimums-value poor">
                  <span className="value-label">Poor:</span>
                  <span className="value-text">&gt; {limits.precipMarginal} mm/hr</span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="minimums-disclaimer">
            ⚠️ These are suggested minimums only. Always consult your aircraft POH and apply pilot-in-command judgement.
          </p>
        </div>
      )}
      
      <style jsx>{`
        .minimums-panel {
          margin: 1.5rem 0;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%);
        }
        .minimums-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 1rem 1.25rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
          border: none;
          cursor: pointer;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1e293b;
          transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .minimums-toggle:hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%);
        }
        .minimums-toggle-icon {
          font-size: 1.5rem;
        }
        .minimums-toggle-text {
          flex: 1;
          text-align: left;
        }
        .minimums-toggle-arrow {
          color: #6366f1;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .minimums-content {
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.6);
        }
        .minimums-description {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 1rem;
          font-style: italic;
        }
        .minimums-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
          margin-bottom: 1rem;
        }
        .minimums-table th,
        .minimums-table td {
          padding: 0.75rem 0.625rem;
          text-align: left;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .minimums-table th {
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%);
          font-weight: 700;
          color: #1e293b;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .minimums-table td.good {
          color: #059669;
          font-weight: 600;
        }
        .minimums-table td.marginal {
          color: #d97706;
          font-weight: 600;
        }
        .minimums-table td.poor {
          color: #dc2626;
          font-weight: 600;
        }
        .minimums-disclaimer {
          font-size: 0.75rem;
          color: #64748b;
          background: linear-gradient(135deg, rgba(254, 243, 199, 0.6) 0%, rgba(253, 230, 138, 0.4) 100%);
          padding: 0.875rem;
          border-radius: 10px;
          margin: 0;
          line-height: 1.5;
        }
        
        /* Mobile Card View */
        .minimums-cards {
          display: none;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .minimums-card {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          padding: 1rem;
          border: 1px solid rgba(0, 0, 0, 0.06);
        }
        .minimums-card-header {
          font-weight: 700;
          font-size: 0.9375rem;
          color: #1e293b;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid rgba(99, 102, 241, 0.2);
        }
        .minimums-card-values {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }
        .minimums-value {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.625rem;
          border-radius: 8px;
          font-size: 0.8125rem;
        }
        .minimums-value.good {
          background: rgba(5, 150, 105, 0.1);
          color: #059669;
        }
        .minimums-value.marginal {
          background: rgba(217, 119, 6, 0.1);
          color: #d97706;
        }
        .minimums-value.poor {
          background: rgba(220, 38, 38, 0.1);
          color: #dc2626;
        }
        .value-label {
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .value-text {
          font-weight: 700;
          font-size: 0.875rem;
        }
        
        /* Responsive: Show table on desktop, cards on mobile */
        @media (max-width: 768px) {
          .desktop-only {
            display: none;
          }
          .mobile-only {
            display: flex;
          }
        }
        @media (min-width: 769px) {
          .desktop-only {
            display: table;
          }
          .mobile-only {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

interface FlightDecisionProps {
  windSpeed: number;
  visibility: number;
  cloudCover: number;
  cloudBase: number;
  precipitation: number;
  aircraftType: AircraftType;
}

export const FlightDecision: React.FC<FlightDecisionProps> = ({
  windSpeed,
  visibility,
  cloudCover,
  cloudBase,
  precipitation,
  aircraftType,
}) => {
  // UK Met Office API returns wind speed in km/h
  // Convert km/h to knots: 1 km/h = 0.539957 knots
  // Convert km/h to mph: 1 km/h = 0.621371 mph
  const windSpeedKnots = windSpeed * 0.539957;
  const windSpeedMph = windSpeed * 0.621371;
  // Convert meters to feet
  const visibilityFeet = visibility * 3.28084;
  const cloudBaseFeet = cloudBase;

  // Get limits for selected aircraft type
  const limits = AIRCRAFT_LIMITS[aircraftType];

  // Decision criteria based on aircraft type
  const criteria = {
    windSpeed: {
      good: windSpeedKnots < limits.windGood,
      marginal: windSpeedKnots >= limits.windGood && windSpeedKnots < limits.windMarginal,
      poor: windSpeedKnots >= limits.windMarginal,
    },
    visibility: {
      good: visibilityFeet >= limits.visGood,
      marginal: visibilityFeet >= limits.visMarginal && visibilityFeet < limits.visGood,
      poor: visibilityFeet < limits.visMarginal,
    },
    cloudBase: {
      good: cloudBaseFeet >= limits.cloudBaseGood,
      marginal: cloudBaseFeet >= limits.cloudBaseMarginal && cloudBaseFeet < limits.cloudBaseGood,
      poor: cloudBaseFeet < limits.cloudBaseMarginal,
    },
    cloudCover: {
      good: cloudCover < limits.cloudCoverGood,
      marginal: cloudCover >= limits.cloudCoverGood && cloudCover < limits.cloudCoverMarginal,
      poor: cloudCover >= limits.cloudCoverMarginal,
    },
    precipitation: {
      good: precipitation <= limits.precipGood,
      marginal: precipitation > limits.precipGood && precipitation < limits.precipMarginal,
      poor: precipitation >= limits.precipMarginal,
    },
  };

  // Get detailed criterion information with dynamic limits
  const getCriterionDetails = (name: string, criterion: { good: boolean; marginal: boolean; poor: boolean }, value: number, unit: string) => {
    let status: 'good' | 'marginal' | 'poor';
    let threshold: string;
    let explanation: string;
    const aircraft = AIRCRAFT_LABELS[aircraftType];

    if (criterion.good) {
      status = 'good';
      if (name === 'windSpeed') {
        threshold = `< ${limits.windGood} kts`;
        explanation = `Wind speed is within safe limits for ${aircraft}`;
      } else if (name === 'visibility') {
        threshold = `≥ ${(limits.visGood / 1000).toFixed(0)} km`;
        explanation = `Visibility meets minimum requirements for ${aircraft}`;
      } else if (name === 'cloudBase') {
        threshold = `≥ ${limits.cloudBaseGood} ft`;
        explanation = `Cloud base provides adequate clearance for ${aircraft}`;
      } else if (name === 'cloudCover') {
        threshold = `< ${limits.cloudCoverGood}%`;
        explanation = 'Low cloud cover allows good visibility';
      } else {
        threshold = 'None';
        explanation = 'No precipitation expected';
      }
    } else if (criterion.marginal) {
      status = 'marginal';
      if (name === 'windSpeed') {
        threshold = `${limits.windGood}-${limits.windMarginal} kts`;
        explanation = `Wind speed is elevated for ${aircraft}. Exercise caution`;
      } else if (name === 'visibility') {
        threshold = `${(limits.visMarginal / 1000).toFixed(0)}-${(limits.visGood / 1000).toFixed(0)} km`;
        explanation = `Visibility is reduced but may be acceptable for experienced ${aircraft} pilots`;
      } else if (name === 'cloudBase') {
        threshold = `${limits.cloudBaseMarginal}-${limits.cloudBaseGood} ft`;
        explanation = `Cloud base is low for ${aircraft}. May limit operations`;
      } else if (name === 'cloudCover') {
        threshold = `${limits.cloudCoverGood}-${limits.cloudCoverMarginal}%`;
        explanation = 'Moderate cloud cover. Monitor conditions closely';
      } else {
        threshold = 'Light';
        explanation = `Light precipitation. May affect ${aircraft} performance`;
      }
    } else {
      status = 'poor';
      if (name === 'windSpeed') {
        threshold = `≥ ${limits.windMarginal} kts`;
        explanation = `High wind speeds - not recommended for ${aircraft}`;
      } else if (name === 'visibility') {
        threshold = `< ${(limits.visMarginal / 1000).toFixed(0)} km`;
        explanation = `Poor visibility - below safe limits for ${aircraft}`;
      } else if (name === 'cloudBase') {
        threshold = `< ${limits.cloudBaseMarginal} ft`;
        explanation = `Very low cloud base - not safe for ${aircraft}`;
      } else if (name === 'cloudCover') {
        threshold = `≥ ${limits.cloudCoverMarginal}%`;
        explanation = 'Heavy cloud cover significantly limits visibility';
      } else {
        threshold = 'Heavy';
        explanation = `Heavy precipitation - hazardous for ${aircraft}`;
      }
    }

    return { status, threshold, explanation };
  };

  // Calculate overall decision
  const getOverallDecision = () => {
    const scores = {
      good: 0,
      marginal: 0,
      poor: 0,
    };

    Object.values(criteria).forEach((criterion) => {
      if (criterion.good) scores.good++;
      else if (criterion.marginal) scores.marginal++;
      else scores.poor++;
    });

    if (scores.poor > 0 || scores.marginal >= 3) {
      return {
        status: 'poor',
        text: 'Not Recommended',
        color: '#ef4444',
        emoji: '❌',
        message: 'Weather conditions are not suitable for VFR flight',
        reasoning: `${scores.poor} critical condition(s) and ${scores.marginal} marginal condition(s) detected. Flight not recommended.`,
      };
    } else if (scores.marginal > 0) {
      return {
        status: 'marginal',
        text: 'Marginal',
        color: '#f59e0b',
        emoji: '⚠️',
        message: 'Exercise caution. Conditions are marginal for VFR flight',
        reasoning: `${scores.marginal} marginal condition(s) detected. ${scores.good} condition(s) are good. Exercise extra caution and consider delaying if conditions deteriorate.`,
      };
    } else {
      return {
        status: 'good',
        text: 'Good',
        color: '#10b981',
        emoji: '✅',
        message: 'Weather conditions are suitable for VFR flight',
        reasoning: `All ${scores.good} conditions are within acceptable limits for VFR operations.`,
      };
    }
  };

  const decision = getOverallDecision();

  return (
    <div className="flight-decision">
      <div className="decision-header">
        <h2>Flight Decision</h2>
        <span className="aircraft-type-badge">{AIRCRAFT_LABELS[aircraftType]}</span>
      </div>
      <div className="decision-status" style={{ 
        background: `linear-gradient(135deg, ${decision.color}15 0%, ${decision.color}08 100%)`,
        borderColor: decision.color,
        boxShadow: `0 8px 24px ${decision.color}20`
      }}>
        <div className="decision-emoji-wrapper">
          <div className={`decision-emoji decision-emoji-${decision.status}`}>
            <img 
              src={
                decision.status === 'good' 
                  ? '/icons/flightStatus/flightOK.png'
                  : decision.status === 'poor'
                  ? '/icons/flightStatus/flightNo.png'
                  : '/icons/flightStatus/flightMarginal.png'
              }
              alt={decision.text}
              className="flight-status-image"
            />
          </div>
        </div>
        <div className="decision-text">
          <div className="decision-title">{decision.text}</div>
          <div className="decision-message">{decision.message}</div>
        </div>
      </div>
      <div className="decision-reasoning" style={{ borderLeftColor: decision.color }}>
        <div className="reasoning-icon">💭</div>
        <div className="reasoning-content">
          <h3>Decision Reasoning</h3>
          <p>{decision.reasoning}</p>
        </div>
      </div>

      <MinimumsPanel aircraftType={aircraftType} limits={limits} />

      <div className="criteria-explanation">
        <div className="criteria-header">
          <h3>📊 Detailed Criteria Analysis</h3>
        </div>
        <p className="explanation-intro">
          Each condition is evaluated against VFR flight standards. The overall decision is based on the combination of all factors.
        </p>
        
        <div className="decision-criteria">
          <div className={`criterion-detailed ${criteria.windSpeed.good ? 'good' : criteria.windSpeed.marginal ? 'marginal' : 'poor'}`}>
            <div className="criterion-icon">💨</div>
            <div className="criterion-content">
              <div className="criterion-header">
                <span className="criterion-label">Wind Speed</span>
                <span className={`criterion-status ${criteria.windSpeed.good ? 'good' : criteria.windSpeed.marginal ? 'marginal' : 'poor'}`}>
                  {criteria.windSpeed.good ? '✅ Good' : criteria.windSpeed.marginal ? '⚠️ Marginal' : '❌ Poor'}
                </span>
              </div>
              <div className="criterion-value-large">
                {windSpeedKnots.toFixed(0)} <span className="criterion-unit">kts</span>
                <span className="criterion-value-secondary">({windSpeedMph.toFixed(0)} mph)</span>
              </div>
              <div className="criterion-progress-bar">
                <div 
                  className={`criterion-progress ${criteria.windSpeed.good ? 'good' : criteria.windSpeed.marginal ? 'marginal' : 'poor'}`}
                  style={{ 
                    width: `${Math.min(100, (windSpeedKnots / limits.windMarginal) * 100)}%` 
                  }}
                />
              </div>
              <div className="criterion-threshold">
                <strong>Threshold:</strong> {getCriterionDetails('windSpeed', criteria.windSpeed, windSpeedKnots, 'kts').threshold}
              </div>
              <div className="criterion-explanation-text">
                {getCriterionDetails('windSpeed', criteria.windSpeed, windSpeedKnots, 'kts').explanation}
              </div>
            </div>
          </div>

          <div className={`criterion-detailed ${criteria.visibility.good ? 'good' : criteria.visibility.marginal ? 'marginal' : 'poor'}`}>
            <div className="criterion-icon">👁️</div>
            <div className="criterion-content">
              <div className="criterion-header">
                <span className="criterion-label">Visibility</span>
                <span className={`criterion-status ${criteria.visibility.good ? 'good' : criteria.visibility.marginal ? 'marginal' : 'poor'}`}>
                  {criteria.visibility.good ? '✅ Good' : criteria.visibility.marginal ? '⚠️ Marginal' : '❌ Poor'}
                </span>
              </div>
              <div className="criterion-value-large">
                {(visibilityFeet / 1000).toFixed(1)} <span className="criterion-unit">km</span>
                <span className="criterion-value-secondary">({(visibilityFeet / 5280).toFixed(1)} SM)</span>
              </div>
              <div className="criterion-progress-bar">
                <div 
                  className={`criterion-progress ${criteria.visibility.good ? 'good' : criteria.visibility.marginal ? 'marginal' : 'poor'}`}
                  style={{ 
                    width: `${Math.min(100, (visibilityFeet / limits.visGood) * 100)}%` 
                  }}
                />
              </div>
              <div className="criterion-threshold">
                <strong>Threshold:</strong> {getCriterionDetails('visibility', criteria.visibility, visibilityFeet, 'ft').threshold}
              </div>
              <div className="criterion-explanation-text">
                {getCriterionDetails('visibility', criteria.visibility, visibilityFeet, 'ft').explanation}
              </div>
            </div>
          </div>

          <div className={`criterion-detailed ${criteria.cloudBase.good ? 'good' : criteria.cloudBase.marginal ? 'marginal' : 'poor'}`}>
            <div className="criterion-icon">☁️</div>
            <div className="criterion-content">
              <div className="criterion-header">
                <span className="criterion-label">Cloud Base</span>
                <span className={`criterion-status ${criteria.cloudBase.good ? 'good' : criteria.cloudBase.marginal ? 'marginal' : 'poor'}`}>
                  {criteria.cloudBase.good ? '✅ Good' : criteria.cloudBase.marginal ? '⚠️ Marginal' : '❌ Poor'}
                </span>
              </div>
              <div className="criterion-value-large">
                {cloudBaseFeet > 0 ? `${Math.round(cloudBaseFeet)}` : 'N/A'} <span className="criterion-unit">ft</span>
              </div>
              <div className="criterion-progress-bar">
                <div 
                  className={`criterion-progress ${criteria.cloudBase.good ? 'good' : criteria.cloudBase.marginal ? 'marginal' : 'poor'}`}
                  style={{ 
                    width: `${Math.min(100, cloudBaseFeet > 0 ? (cloudBaseFeet / limits.cloudBaseGood) * 100 : 0)}%` 
                  }}
                />
              </div>
              <div className="criterion-threshold">
                <strong>Threshold:</strong> {getCriterionDetails('cloudBase', criteria.cloudBase, cloudBaseFeet, 'ft').threshold}
              </div>
              <div className="criterion-explanation-text">
                {getCriterionDetails('cloudBase', criteria.cloudBase, cloudBaseFeet, 'ft').explanation}
              </div>
            </div>
          </div>

          <div className={`criterion-detailed ${criteria.cloudCover.good ? 'good' : criteria.cloudCover.marginal ? 'marginal' : 'poor'}`}>
            <div className="criterion-icon">🌫️</div>
            <div className="criterion-content">
              <div className="criterion-header">
                <span className="criterion-label">Cloud Cover</span>
                <span className={`criterion-status ${criteria.cloudCover.good ? 'good' : criteria.cloudCover.marginal ? 'marginal' : 'poor'}`}>
                  {criteria.cloudCover.good ? '✅ Good' : criteria.cloudCover.marginal ? '⚠️ Marginal' : '❌ Poor'}
                </span>
              </div>
              <div className="criterion-value-large">
                {Math.round(cloudCover)}<span className="criterion-unit">%</span>
              </div>
              <div className="criterion-progress-bar">
                <div 
                  className={`criterion-progress ${criteria.cloudCover.good ? 'good' : criteria.cloudCover.marginal ? 'marginal' : 'poor'}`}
                  style={{ width: `${cloudCover}%` }}
                />
              </div>
              <div className="criterion-threshold">
                <strong>Threshold:</strong> {getCriterionDetails('cloudCover', criteria.cloudCover, cloudCover, '%').threshold}
              </div>
              <div className="criterion-explanation-text">
                {getCriterionDetails('cloudCover', criteria.cloudCover, cloudCover, '%').explanation}
              </div>
            </div>
          </div>

          <div className={`criterion-detailed ${criteria.precipitation.good ? 'good' : criteria.precipitation.marginal ? 'marginal' : 'poor'}`}>
            <div className="criterion-icon">🌧️</div>
            <div className="criterion-content">
              <div className="criterion-header">
                <span className="criterion-label">Precipitation</span>
                <span className={`criterion-status ${criteria.precipitation.good ? 'good' : criteria.precipitation.marginal ? 'marginal' : 'poor'}`}>
                  {criteria.precipitation.good ? '✅ Good' : criteria.precipitation.marginal ? '⚠️ Marginal' : '❌ Poor'}
                </span>
              </div>
              <div className="criterion-value-large">
                {precipitation.toFixed(1)} <span className="criterion-unit">mm/hr</span>
              </div>
              <div className="criterion-progress-bar">
                <div 
                  className={`criterion-progress ${criteria.precipitation.good ? 'good' : criteria.precipitation.marginal ? 'marginal' : 'poor'}`}
                  style={{ 
                    width: `${Math.min(100, limits.precipMarginal > 0 ? (precipitation / limits.precipMarginal) * 100 : 0)}%` 
                  }}
                />
              </div>
              <div className="criterion-threshold">
                <strong>Threshold:</strong> {getCriterionDetails('precipitation', criteria.precipitation, precipitation, 'mm').threshold}
              </div>
              <div className="criterion-explanation-text">
                {getCriterionDetails('precipitation', criteria.precipitation, precipitation, 'mm').explanation}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .flight-decision {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 1.25rem;
          box-shadow: 
            0 4px 30px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.3);
          margin-bottom: 1.25rem;
        }
        .decision-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }
        .decision-header h2 {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .aircraft-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          box-shadow: 0 2px 10px rgba(99, 102, 241, 0.3);
        }
        .decision-status {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          border-radius: 20px;
          border: 3px solid;
          margin-bottom: 1.25rem;
          position: relative;
          overflow: hidden;
        }
        .decision-emoji-wrapper {
          flex-shrink: 0;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .decision-emoji {
          font-size: 2.5rem;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .flight-status-image {
          width: 64px;
          height: 64px;
          object-fit: contain;
          display: block;
          border-radius: 12px;
        }
        .decision-text {
          flex: 1;
          min-width: 0;
        }
        .decision-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          color: #1e293b;
          letter-spacing: -0.02em;
        }
        .decision-message {
          font-size: 0.9375rem;
          color: #64748b;
          line-height: 1.5;
          font-weight: 500;
        }
        .decision-reasoning {
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%);
          padding: 1.25rem;
          border-radius: 16px;
          margin-bottom: 1.25rem;
          border-left: 4px solid;
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        .reasoning-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }
        .reasoning-content {
          flex: 1;
        }
        .reasoning-content h3 {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }
        .reasoning-content p {
          color: #64748b;
          line-height: 1.6;
          font-size: 0.875rem;
          margin: 0;
        }
        .criteria-explanation {
          margin-top: 1.5rem;
        }
        .criteria-header {
          margin-bottom: 1rem;
        }
        .criteria-explanation h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .explanation-intro {
          color: #64748b;
          font-size: 0.875rem;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          line-height: 1.6;
        }
        /* Flight status image animations */
        .flight-status-image {
          transition: transform 0.3s ease-out;
        }
        .decision-emoji-good .flight-status-image {
          animation: pulse 2s ease-in-out infinite;
        }
        .decision-emoji-poor .flight-status-image {
          animation: fade 3s ease-in-out infinite;
        }
        .decision-emoji-marginal .flight-status-image {
          animation: shake 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        @keyframes fade {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-2px);
          }
          75% {
            transform: translateX(2px);
          }
        }
        @media (max-width: 640px) {
          .criteria-explanation h3 {
            font-size: 1rem;
          }
          .explanation-intro {
            font-size: 0.8125rem;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
          }
        }
        .decision-criteria {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .criterion-detailed {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          padding: 1.25rem;
          border: 2px solid transparent;
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .criterion-detailed.good {
          border-color: rgba(5, 150, 105, 0.2);
          background: linear-gradient(135deg, rgba(209, 250, 229, 0.3) 0%, rgba(255, 255, 255, 0.9) 100%);
        }
        .criterion-detailed.marginal {
          border-color: rgba(217, 119, 6, 0.2);
          background: linear-gradient(135deg, rgba(254, 243, 199, 0.3) 0%, rgba(255, 255, 255, 0.9) 100%);
        }
        .criterion-detailed.poor {
          border-color: rgba(220, 38, 38, 0.2);
          background: linear-gradient(135deg, rgba(254, 226, 226, 0.3) 0%, rgba(255, 255, 255, 0.9) 100%);
        }
        .criterion-icon {
          font-size: 2rem;
          flex-shrink: 0;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .criterion-content {
          flex: 1;
          min-width: 0;
        }
        .criterion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .criterion-label {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .criterion-status {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          white-space: nowrap;
        }
        .criterion-status.good {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #065f46;
        }
        .criterion-status.marginal {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
        }
        .criterion-status.poor {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #991b1b;
        }
        .criterion-value-large {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .criterion-unit {
          font-size: 1rem;
          font-weight: 600;
          color: #64748b;
          margin-left: 0.25rem;
        }
        .criterion-value-secondary {
          display: block;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #64748b;
          margin-top: 0.25rem;
        }
        .criterion-progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(0, 0, 0, 0.08);
          border-radius: 9999px;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }
        .criterion-progress {
          height: 100%;
          border-radius: 9999px;
          transition: width 300ms ease-out;
        }
        .criterion-progress.good {
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }
        .criterion-progress.marginal {
          background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
        }
        .criterion-progress.poor {
          background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
        }
        .criterion-threshold {
          font-size: 0.8125rem;
          color: #64748b;
          margin-bottom: 0.5rem;
        }
        .criterion-threshold strong {
          color: #1e293b;
          font-weight: 600;
        }
        .criterion-explanation-text {
          font-size: 0.8125rem;
          color: #64748b;
          line-height: 1.5;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }
        @media (max-width: 640px) {
          .flight-decision {
            padding: 1rem;
            border-radius: 20px;
          }
          .decision-header h2 {
            font-size: 1.125rem;
          }
          .decision-status {
            flex-direction: row;
            padding: 1.25rem;
            gap: 0.875rem;
          }
          .decision-emoji-wrapper {
            width: 56px;
            height: 56px;
          }
          .decision-emoji {
            font-size: 2rem;
          }
          .decision-title {
            font-size: 1.25rem;
          }
          .decision-message {
            font-size: 0.875rem;
          }
          .decision-reasoning {
            flex-direction: row;
            padding: 1rem;
            gap: 0.75rem;
          }
          .reasoning-icon {
            font-size: 1.25rem;
          }
          .criterion-detailed {
            padding: 1rem;
            gap: 0.875rem;
          }
          .criterion-icon {
            width: 48px;
            height: 48px;
            font-size: 1.75rem;
          }
          .criterion-value-large {
            font-size: 1.5rem;
          }
          .criterion-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          .criterion-label {
            font-size: 0.8125rem;
          }
        }
        @media (min-width: 641px) {
          .decision-criteria {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

