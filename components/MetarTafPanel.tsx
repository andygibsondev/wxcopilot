'use client';

import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    if (!icao) {
      setData(null);
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

