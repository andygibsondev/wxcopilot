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
    icon: '🪂',
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
          
          <table className="minimums-table">
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
          
          <p className="minimums-disclaimer">
            ⚠️ These are suggested minimums only. Always consult your aircraft POH and apply pilot-in-command judgement.
          </p>
        </div>
      )}
      
      <style jsx>{`
        .minimums-panel {
          margin: 1.5rem 0;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .minimums-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #f8f9fa;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          transition: background 0.2s;
        }
        .minimums-toggle:hover {
          background: #e9ecef;
        }
        .minimums-toggle-icon {
          font-size: 1.5rem;
        }
        .minimums-toggle-text {
          flex: 1;
          text-align: left;
        }
        .minimums-toggle-arrow {
          color: #666;
          font-size: 0.75rem;
        }
        .minimums-content {
          padding: 1rem;
          background: white;
        }
        .minimums-description {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 1rem;
          font-style: italic;
        }
        .minimums-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
        .minimums-table th,
        .minimums-table td {
          padding: 0.625rem 0.5rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .minimums-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
        }
        .minimums-table td.good {
          color: #059669;
          font-weight: 500;
        }
        .minimums-table td.marginal {
          color: #d97706;
          font-weight: 500;
        }
        .minimums-table td.poor {
          color: #dc2626;
          font-weight: 500;
        }
        .minimums-disclaimer {
          font-size: 0.75rem;
          color: #666;
          background: #fffbeb;
          padding: 0.75rem;
          border-radius: 4px;
          margin: 0;
        }
        @media (max-width: 640px) {
          .minimums-table {
            font-size: 0.75rem;
          }
          .minimums-table th,
          .minimums-table td {
            padding: 0.5rem 0.25rem;
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
      <div className="decision-status" style={{ backgroundColor: decision.color + '20', borderColor: decision.color }}>
        <div className="decision-emoji">{decision.emoji}</div>
        <div className="decision-text">
          <div className="decision-title">{decision.text}</div>
          <div className="decision-message">{decision.message}</div>
        </div>
      </div>
      <div className="decision-reasoning" style={{ borderLeftColor: decision.color }}>
        <h3>Decision Reasoning</h3>
        <p>{decision.reasoning}</p>
      </div>

      <MinimumsPanel aircraftType={aircraftType} limits={limits} />

      <div className="criteria-explanation">
        <h3>Detailed Criteria Analysis</h3>
        <p className="explanation-intro">
          Each condition is evaluated against VFR flight standards. The overall decision is based on the combination of all factors.
        </p>
        
        <div className="decision-criteria">
          <div className="criterion-detailed">
            <div className="criterion-header">
              <span className="criterion-label">Wind Speed</span>
              <span className={`criterion-status ${criteria.windSpeed.good ? 'good' : criteria.windSpeed.marginal ? 'marginal' : 'poor'}`}>
                {criteria.windSpeed.good ? '✅ Good' : criteria.windSpeed.marginal ? '⚠️ Marginal' : '❌ Poor'}
              </span>
            </div>
            <div className="criterion-value-large">
              {windSpeedKnots.toFixed(0)} kts
              <span className="criterion-value-secondary">({windSpeedMph.toFixed(0)} mph)</span>
            </div>
            <div className="criterion-threshold">
              <strong>Threshold:</strong> {getCriterionDetails('windSpeed', criteria.windSpeed, windSpeedKnots, 'kts').threshold}
            </div>
            <div className="criterion-explanation-text">
              {getCriterionDetails('windSpeed', criteria.windSpeed, windSpeedKnots, 'kts').explanation}
            </div>
          </div>

          <div className="criterion-detailed">
            <div className="criterion-header">
              <span className="criterion-label">Visibility</span>
              <span className={`criterion-status ${criteria.visibility.good ? 'good' : criteria.visibility.marginal ? 'marginal' : 'poor'}`}>
                {criteria.visibility.good ? '✅ Good' : criteria.visibility.marginal ? '⚠️ Marginal' : '❌ Poor'}
              </span>
            </div>
            <div className="criterion-value-large">
              {(visibilityFeet / 1000).toFixed(1)} km ({(visibilityFeet / 5280).toFixed(1)} SM)
            </div>
            <div className="criterion-threshold">
              <strong>Threshold:</strong> {getCriterionDetails('visibility', criteria.visibility, visibilityFeet, 'ft').threshold}
            </div>
            <div className="criterion-explanation-text">
              {getCriterionDetails('visibility', criteria.visibility, visibilityFeet, 'ft').explanation}
            </div>
          </div>

          <div className="criterion-detailed">
            <div className="criterion-header">
              <span className="criterion-label">Cloud Base</span>
              <span className={`criterion-status ${criteria.cloudBase.good ? 'good' : criteria.cloudBase.marginal ? 'marginal' : 'poor'}`}>
                {criteria.cloudBase.good ? '✅ Good' : criteria.cloudBase.marginal ? '⚠️ Marginal' : '❌ Poor'}
              </span>
            </div>
            <div className="criterion-value-large">
              {cloudBaseFeet > 0 ? `${Math.round(cloudBaseFeet)} ft` : 'N/A'}
            </div>
            <div className="criterion-threshold">
              <strong>Threshold:</strong> {getCriterionDetails('cloudBase', criteria.cloudBase, cloudBaseFeet, 'ft').threshold}
            </div>
            <div className="criterion-explanation-text">
              {getCriterionDetails('cloudBase', criteria.cloudBase, cloudBaseFeet, 'ft').explanation}
            </div>
          </div>

          <div className="criterion-detailed">
            <div className="criterion-header">
              <span className="criterion-label">Cloud Cover</span>
              <span className={`criterion-status ${criteria.cloudCover.good ? 'good' : criteria.cloudCover.marginal ? 'marginal' : 'poor'}`}>
                {criteria.cloudCover.good ? '✅ Good' : criteria.cloudCover.marginal ? '⚠️ Marginal' : '❌ Poor'}
              </span>
            </div>
            <div className="criterion-value-large">
              {Math.round(cloudCover)}%
            </div>
            <div className="criterion-threshold">
              <strong>Threshold:</strong> {getCriterionDetails('cloudCover', criteria.cloudCover, cloudCover, '%').threshold}
            </div>
            <div className="criterion-explanation-text">
              {getCriterionDetails('cloudCover', criteria.cloudCover, cloudCover, '%').explanation}
            </div>
          </div>

          <div className="criterion-detailed">
            <div className="criterion-header">
              <span className="criterion-label">Precipitation</span>
              <span className={`criterion-status ${criteria.precipitation.good ? 'good' : criteria.precipitation.marginal ? 'marginal' : 'poor'}`}>
                {criteria.precipitation.good ? '✅ Good' : criteria.precipitation.marginal ? '⚠️ Marginal' : '❌ Poor'}
              </span>
            </div>
            <div className="criterion-value-large">
              {precipitation.toFixed(1)} mm/hr
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
      <style jsx>{`
        .flight-decision {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-top: 2rem;
        }
        .decision-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .decision-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin: 0;
        }
        .aircraft-type-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.375rem 0.75rem;
          background: #667eea;
          color: white;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .decision-status {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          border-radius: 12px;
          border: 2px solid;
          margin-bottom: 1.5rem;
        }
        .decision-emoji {
          font-size: 3rem;
        }
        .decision-text {
          flex: 1;
        }
        .decision-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .decision-message {
          font-size: 1rem;
          color: #666;
        }
        .decision-reasoning {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          border-left: 4px solid;
        }
        .decision-reasoning h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.75rem;
        }
        .decision-reasoning p {
          color: #666;
          line-height: 1.6;
        }
        .criteria-explanation {
          margin-top: 2rem;
        }
        .criteria-explanation h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }
        .explanation-intro {
          color: #666;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .decision-criteria {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .criterion-detailed {
          background: #f9fafb;
          border-radius: 12px;
          padding: 1.5rem;
          border: 2px solid #e5e7eb;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .criterion-detailed:hover {
          border-color: #667eea;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .criterion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .criterion-label {
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .criterion-status {
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
        }
        .criterion-status.good {
          background: #d1fae5;
          color: #065f46;
        }
        .criterion-status.marginal {
          background: #fef3c7;
          color: #92400e;
        }
        .criterion-status.poor {
          background: #fee2e2;
          color: #991b1b;
        }
        .criterion-value-large {
          font-size: 1.75rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 0.75rem;
        }
        .criterion-value-secondary {
          display: block;
          font-size: 1rem;
          font-weight: 500;
          color: #666;
          margin-top: 0.25rem;
        }
        .criterion-threshold {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.5rem;
        }
        .criterion-threshold strong {
          color: #333;
        }
        .criterion-explanation-text {
          font-size: 0.875rem;
          color: #666;
          line-height: 1.5;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
        }
        @media (max-width: 640px) {
          .decision-status {
            flex-direction: column;
            text-align: center;
          }
          .decision-criteria {
            grid-template-columns: 1fr;
          }
          .criterion-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

