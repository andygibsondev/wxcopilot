'use client';

import React, { useState, useEffect, useRef } from 'react';

const METAR_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

// Helper functions for human-readable TAF parsing
const getCloudCoverDescription = (cover: string): string => {
  const coverMap: { [key: string]: string } = {
    'FEW': 'Few clouds',
    'SCT': 'Scattered clouds',
    'BKN': 'Broken clouds',
    'OVC': 'Overcast',
    'CLR': 'Clear',
    'SKC': 'Sky clear',
    'NSC': 'No significant clouds',
    'NCD': 'No cloud detected',
  };
  return coverMap[cover] || cover;
};

const getChangeIndicatorDescription = (changeInd?: string): string => {
  if (!changeInd) return '';
  const changeMap: { [key: string]: string } = {
    'TEMPO': 'Temporary conditions expected',
    'PROB': 'Probable conditions',
    'BECMG': 'Becoming (gradual change)',
    'FM': 'From (specific time)',
    'PROB30': '30% probability',
    'PROB40': '40% probability',
  };
  return changeMap[changeInd] || changeInd;
};

const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

const getVisibilityDescription = (visib: number): string => {
  if (visib >= 10) return 'Excellent visibility';
  if (visib >= 6) return 'Good visibility';
  if (visib >= 3) return 'Moderate visibility';
  if (visib >= 1) return 'Reduced visibility';
  return 'Poor visibility';
};

const getWindDescription = (wdir?: number, wspd?: number, wgst?: number): string => {
  if (wdir === undefined || wspd === undefined) return '';
  
  const direction = getWindDirection(wdir);
  let desc = `Wind from ${direction} (${wdir}°) at ${wspd} knots`;
  
  if (wgst) {
    desc += `, gusting to ${wgst} knots`;
  }
  
  // Add wind strength description
  if (wspd < 5) {
    desc += ' - Light winds';
  } else if (wspd < 15) {
    desc += ' - Light to moderate winds';
  } else if (wspd < 25) {
    desc += ' - Moderate winds';
  } else if (wspd < 35) {
    desc += ' - Strong winds';
  } else {
    desc += ' - Very strong winds';
  }
  
  return desc;
};

const getCloudDescription = (clouds: Array<{ cover: string; base: number }>): string => {
  if (!clouds || clouds.length === 0) return 'Clear skies';
  
  return clouds.map((cloud, idx) => {
    const coverDesc = getCloudCoverDescription(cloud.cover);
    const baseFeet = cloud.base;
    const baseDesc = baseFeet < 1000 ? `${baseFeet}ft (very low)` :
                     baseFeet < 3000 ? `${baseFeet}ft (low)` :
                     baseFeet < 10000 ? `${baseFeet}ft (medium)` :
                     `${baseFeet}ft (high)`;
    
    return `${coverDesc} at ${baseDesc}`;
  }).join(', ');
};

const generateHumanSummary = (fcst: any): string => {
  const parts: string[] = [];
  
  // Time period
  if (fcst.fcstTimeFrom && fcst.fcstTimeTo) {
    const from = new Date(fcst.fcstTimeFrom);
    const to = new Date(fcst.fcstTimeTo);
    const timeStr = `${from.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} to ${to.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    parts.push(`During ${timeStr}`);
  }
  
  // Change indicator
  if (fcst.changeInd) {
    const changeDesc = getChangeIndicatorDescription(fcst.changeInd);
    parts.push(changeDesc);
  }
  
  // Wind
  if (fcst.wdir !== undefined && fcst.wspd !== undefined) {
    const windDesc = getWindDescription(fcst.wdir, fcst.wspd, fcst.wgst);
    if (windDesc) parts.push(windDesc);
  }
  
  // Visibility
  if (fcst.visib !== undefined) {
    parts.push(`${getVisibilityDescription(fcst.visib)} (${fcst.visib} statute miles)`);
  }
  
  // Clouds
  if (fcst.clouds && fcst.clouds.length > 0) {
    parts.push(getCloudDescription(fcst.clouds));
  } else {
    parts.push('Clear skies');
  }
  
  // Weather
  if (fcst.wxString) {
    parts.push(`Weather: ${fcst.wxString}`);
  }
  
  return parts.join('. ') + '.';
};

interface MetarTafPanelProps {
  icao?: string;
  aerodromeName: string;
}

interface MetarTafData {
  metar: {
    rawOb?: string;
    icaoId?: string;
    obsTime?: string;
    reportTime?: string;
    temp?: number;
    dewp?: number;
    wdir?: number;
    wspd?: number;
    wgst?: number;
    visib?: number;
    altim?: number;
    clouds?: Array<{
      cover: string;
      base: number;
    }>;
    wxString?: string;
  } | null;
  taf: {
    rawTAF?: string;
    icaoId?: string;
    issueTime?: string;
    validTime?: string;
    forecast?: Array<{
      fcstTimeFrom?: string;
      fcstTimeTo?: string;
      changeInd?: string;
      wdir?: number;
      wspd?: number;
      wgst?: number;
      visib?: number;
      clouds?: Array<{
        cover: string;
        base: number;
      }>;
      wxString?: string;
    }>;
  } | null;
}

export const MetarTafPanel: React.FC<MetarTafPanelProps> = ({
  icao,
  aerodromeName,
}) => {
  const [data, setData] = useState<MetarTafData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchAtRef = useRef<number | null>(null);
  const lastFetchIcaoRef = useRef<string | null>(null);

  useEffect(() => {
    if (!icao) {
      setData(null);
      lastFetchIcaoRef.current = null;
      return;
    }

    // Throttle: skip fetch if we already fetched this icao < 5 mins ago
    const now = Date.now();
    if (
      lastFetchIcaoRef.current === icao &&
      lastFetchAtRef.current != null &&
      now - lastFetchAtRef.current < METAR_COOLDOWN_MS
    ) {
      return;
    }

    const fetchMetarTaf = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/metar-taf?icao=${icao}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch METAR/TAF (${response.status})`);
        }
        const result = await response.json();
        if (result.error) {
          throw new Error(result.error);
        }
        setData(result);
        lastFetchAtRef.current = Date.now();
        lastFetchIcaoRef.current = icao;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch METAR/TAF data';
        setError(errorMessage);
        console.error('METAR/TAF fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetarTaf();
  }, [icao]);

  if (!icao) {
    return (
      <div className="metar-taf-panel">
        <div className="panel-header">
          <h2>METAR & TAF</h2>
        </div>
        <div className="panel-content no-icao">
          <p>ICAO code not available for {aerodromeName}</p>
          <p className="note">METAR and TAF data require an ICAO code</p>
        </div>
        <style jsx>{`
          .metar-taf-panel {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 1.5rem;
            box-shadow: 
              0 4px 30px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.3);
            margin-bottom: 1.25rem;
          }
          .panel-header h2 {
            font-size: 1.375rem;
            font-weight: 800;
            color: #1e293b;
            margin-bottom: 1.25rem;
            letter-spacing: -0.02em;
          }
          .panel-content {
            color: #64748b;
          }
          .no-icao {
            text-align: center;
            padding: 2rem;
          }
          .note {
            font-size: 0.875rem;
            color: #94a3b8;
            margin-top: 0.5rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="metar-taf-panel">
      <div className="panel-header">
        <h2>METAR & TAF</h2>
        <p className="subtitle">{aerodromeName} ({icao})</p>
      </div>

      {loading && (
        <div className="loading">Loading METAR/TAF data...</div>
      )}

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && data && (
        <div className="panel-content">
          {/* METAR Section */}
          <div className="metar-section">
            <h3>METAR (Current Conditions)</h3>
            {data.metar ? (
              <>
                <div className="raw-data">
                  <strong>Raw METAR:</strong>
                  <code>{data.metar.rawOb || 'N/A'}</code>
                </div>
                {data.metar.obsTime && (
                  <div className="data-item">
                    <span className="label">Observation Time:</span>
                    <span className="value">
                      {new Date(data.metar.obsTime).toLocaleString('en-GB')}
                    </span>
                  </div>
                )}
                {data.metar.temp !== undefined && (
                  <div className="data-item">
                    <span className="label">Temperature:</span>
                    <span className="value">{data.metar.temp}°C</span>
                  </div>
                )}
                {data.metar.dewp !== undefined && (
                  <div className="data-item">
                    <span className="label">Dew Point:</span>
                    <span className="value">{data.metar.dewp}°C</span>
                  </div>
                )}
                {data.metar.wdir !== undefined && data.metar.wspd !== undefined && (
                  <div className="data-item">
                    <span className="label">Wind:</span>
                    <span className="value">
                      {data.metar.wdir}° at {data.metar.wspd} kts
                      {data.metar.wgst && `, gusts ${data.metar.wgst} kts`}
                    </span>
                  </div>
                )}
                {data.metar.visib !== undefined && (
                  <div className="data-item">
                    <span className="label">Visibility:</span>
                    <span className="value">{data.metar.visib} statute miles</span>
                  </div>
                )}
                {data.metar.altim !== undefined && (
                  <div className="data-item">
                    <span className="label">Altimeter:</span>
                    <span className="value">{data.metar.altim} inHg</span>
                  </div>
                )}
                {data.metar?.clouds && data.metar.clouds.length > 0 && (
                  <div className="data-item">
                    <span className="label">Clouds:</span>
                    <span className="value">
                      {data.metar.clouds.map((cloud, idx, arr) => (
                        <span key={idx}>
                          {cloud.cover} at {cloud.base} ft
                          {idx < arr.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </span>
                  </div>
                )}
                {data.metar.wxString && (
                  <div className="data-item">
                    <span className="label">Weather:</span>
                    <span className="value">{data.metar.wxString}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="no-data">METAR data not available</p>
            )}
          </div>

          {/* TAF Section */}
          <div className="taf-section">
            <h3>TAF (Terminal Aerodrome Forecast)</h3>
            {data.taf ? (
              <>
                <div className="raw-data">
                  <strong>Raw TAF:</strong>
                  <code>{data.taf.rawTAF || 'N/A'}</code>
                </div>
                {data.taf.issueTime && (
                  <div className="data-item">
                    <span className="label">Issue Time:</span>
                    <span className="value">
                      {new Date(data.taf.issueTime).toLocaleString('en-GB')}
                    </span>
                  </div>
                )}
                {data.taf.validTime && (
                  <div className="data-item">
                    <span className="label">Valid Time:</span>
                    <span className="value">
                      {new Date(data.taf.validTime).toLocaleString('en-GB')}
                    </span>
                  </div>
                )}
                {data.taf.forecast && data.taf.forecast.length > 0 && (
                  <div className="forecast-items">
                    <strong>Forecast Periods:</strong>
                    {data.taf.forecast.map((fcst, idx) => (
                      <div key={idx} className="forecast-item">
                        {fcst.fcstTimeFrom && fcst.fcstTimeTo && (
                          <div className="forecast-time">
                            {new Date(fcst.fcstTimeFrom).toLocaleString('en-GB', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })} - {new Date(fcst.fcstTimeTo).toLocaleString('en-GB', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {fcst.changeInd && ` (${fcst.changeInd})`}
                          </div>
                        )}
                        <div className="forecast-details">
                          {fcst.wdir !== undefined && fcst.wspd !== undefined && (
                            <span>Wind: {fcst.wdir}° at {fcst.wspd} kts</span>
                          )}
                          {fcst.wgst && <span>, gusts {fcst.wgst} kts</span>}
                          {fcst.visib !== undefined && <span> | Visibility: {fcst.visib} SM</span>}
                          {fcst.clouds && fcst.clouds.length > 0 && (
                            <span> | Clouds: {fcst.clouds.map((c, i) => 
                              `${c.cover} at ${c.base} ft${i < fcst.clouds!.length - 1 ? ', ' : ''}`
                            ).join('')}</span>
                          )}
                          {fcst.wxString && <span> | Weather: {fcst.wxString}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Human-Readable TAF Section */}
                {data.taf && data.taf.forecast && Array.isArray(data.taf.forecast) && data.taf.forecast.length > 0 && (
                  <div className="parsed-taf-section">
                    <h4>📋 Human-Readable TAF Forecast</h4>
                    <p className="parsed-intro">
                      This forecast provides a plain-language interpretation of the TAF data to help you understand what conditions to expect.
                    </p>
                    <div className="parsed-forecasts">
                      {data.taf.forecast.map((fcst, idx) => {
                        try {
                          return (
                            <div key={idx} className="parsed-forecast-card">
                              {fcst.fcstTimeFrom && fcst.fcstTimeTo && (
                                <div className="parsed-time-header">
                                  <span className="parsed-time-label">Forecast Period</span>
                                  <span className="parsed-time-value">
                                    {new Date(fcst.fcstTimeFrom).toLocaleString('en-GB', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })} - {new Date(fcst.fcstTimeTo).toLocaleString('en-GB', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  {fcst.changeInd && (
                                    <span className="parsed-change-indicator" title={getChangeIndicatorDescription(fcst.changeInd)}>
                                      {fcst.changeInd}
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              {/* Human-readable summary */}
                              <div className="human-summary">
                                <p className="summary-text">{generateHumanSummary(fcst)}</p>
                              </div>
                              
                              <div className="parsed-conditions">
                                {fcst.wdir !== undefined && fcst.wspd !== undefined && (
                                  <div className="parsed-condition">
                                    <span className="parsed-label">💨 Wind:</span>
                                    <span className="parsed-value">
                                      {getWindDescription(fcst.wdir, fcst.wspd, fcst.wgst)}
                                    </span>
                                  </div>
                                )}
                                {fcst.visib !== undefined && (
                                  <div className="parsed-condition">
                                    <span className="parsed-label">👁️ Visibility:</span>
                                    <span className="parsed-value">
                                      {getVisibilityDescription(fcst.visib)} ({fcst.visib} statute miles)
                                    </span>
                                  </div>
                                )}
                                {fcst.clouds && fcst.clouds.length > 0 ? (
                                  <div className="parsed-condition">
                                    <span className="parsed-label">☁️ Clouds:</span>
                                    <span className="parsed-value">
                                      {getCloudDescription(fcst.clouds)}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="parsed-condition">
                                    <span className="parsed-label">☁️ Clouds:</span>
                                    <span className="parsed-value">Clear skies</span>
                                  </div>
                                )}
                                {fcst.wxString && (
                                  <div className="parsed-condition">
                                    <span className="parsed-label">🌦️ Weather:</span>
                                    <span className="parsed-value">{fcst.wxString}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        } catch (error) {
                          console.error('Error rendering forecast:', error, fcst);
                          return null;
                        }
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="no-data">TAF data not available</p>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .metar-taf-panel {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 1.5rem;
          box-shadow: 
            0 4px 30px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.3);
          margin-bottom: 1.25rem;
        }
        .panel-header h2 {
          font-size: 1.375rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }
        .subtitle {
          color: #64748b;
          font-size: 0.875rem;
          margin-bottom: 1.25rem;
          font-weight: 500;
        }
        .loading {
          text-align: center;
          padding: 2rem;
          color: #64748b;
        }
        .error-message {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #991b1b;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .panel-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .metar-section,
        .taf-section {
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          padding-top: 1.25rem;
        }
        .metar-section:first-child {
          border-top: none;
          padding-top: 0;
        }
        h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
        }
        .raw-data {
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%);
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1rem;
          border-left: 4px solid #6366f1;
        }
        .raw-data strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #1e293b;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        code {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.8125rem;
          color: #6366f1;
          word-break: break-all;
          display: block;
          line-height: 1.5;
        }
        .data-item {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 0.625rem 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }
        .data-item:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: 600;
          color: #64748b;
          min-width: 120px;
          font-size: 0.875rem;
        }
        .value {
          color: #1e293b;
          font-weight: 500;
        }
        .no-data {
          color: #94a3b8;
          font-style: italic;
          padding: 1rem;
        }
        .forecast-items {
          margin-top: 1rem;
        }
        .forecast-items strong {
          display: block;
          margin-bottom: 1rem;
          color: #333;
        }
        .forecast-item {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 0.75rem;
          border-left: 4px solid #10b981;
        }
        .forecast-time {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }
        .forecast-details {
          color: #666;
          font-size: 0.875rem;
        }
        /* Parsed TAF Section */
        .parsed-taf-section {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 2px solid rgba(0, 0, 0, 0.08);
        }
        .parsed-taf-section h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .parsed-intro {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 1.25rem;
          line-height: 1.6;
          font-style: italic;
        }
        .human-summary {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
          border-left: 4px solid #6366f1;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        .summary-text {
          font-size: 0.9375rem;
          line-height: 1.7;
          color: #1e293b;
          margin: 0;
          font-weight: 500;
        }
        .parsed-forecasts {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .parsed-forecast-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
          border-radius: 12px;
          padding: 1.25rem;
          border: 2px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .parsed-time-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          flex-wrap: wrap;
        }
        .parsed-time-label {
          font-size: 0.6875rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .parsed-time-value {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #1e293b;
          flex: 1;
        }
        .parsed-change-indicator {
          font-size: 0.75rem;
          font-weight: 700;
          color: #ffffff;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .parsed-conditions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .parsed-condition {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.625rem 0;
        }
        .parsed-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #64748b;
          min-width: 100px;
          flex-shrink: 0;
        }
        .parsed-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
          flex: 1;
          line-height: 1.5;
        }
        @media (max-width: 640px) {
          .metar-taf-panel {
            padding: 1.25rem;
          }
          .data-item {
            flex-direction: column;
          }
          .label {
            min-width: auto;
          }
          .parsed-time-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          .parsed-condition {
            flex-direction: column;
            gap: 0.25rem;
          }
          .parsed-label {
            min-width: auto;
          }
        }
        @media (min-width: 768px) {
          .metar-taf-panel {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

