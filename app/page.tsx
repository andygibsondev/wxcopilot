'use client';

import React, { useState, useEffect } from 'react';
import { WeatherData } from '@/types/weather';
import { UK_AERODROMES } from '@/data/aerodromes';
import { WeatherCard } from '@/components/WeatherCard';
import { WindDisplay } from '@/components/WindDisplay';
import { CloudBaseDisplay } from '@/components/CloudBaseDisplay';
import { FlightDecision } from '@/components/FlightDecision';
import { MetarTafPanel } from '@/components/MetarTafPanel';
import { DebugPanel } from '@/components/DebugPanel';

// Generate day options for the next 7 days
function getDayOptions() {
  const days = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    days.push({ value: i, label, date });
  }
  return days;
}

// Generate hour options (00:00 - 23:00)
function getHourOptions() {
  return Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${String(i).padStart(2, '0')}:00`,
  }));
}

// Aircraft types with different weather limits
export type AircraftType = 'light' | 'microlight' | 'jet';

const AIRCRAFT_OPTIONS: { value: AircraftType; label: string; icon: string }[] = [
  { value: 'jet', label: 'Big Jet', icon: '✈️' },
  { value: 'light', label: 'Light Aircraft', icon: '🛩️' },
  { value: 'microlight', label: 'Microlight', icon: '🪂' },
];

export default function Home() {
  const [selectedAerodrome, setSelectedAerodrome] = useState(UK_AERODROMES[0]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedHour, setSelectedHour] = useState<number>(12); // Default to noon
  const [aircraftType, setAircraftType] = useState<AircraftType>('light');

  // Compute plannedFlightTime from day/hour selection
  const plannedFlightTime = selectedDay !== null ? (() => {
    const now = new Date();
    const date = new Date(now);
    date.setDate(date.getDate() + selectedDay);
    date.setHours(selectedHour, 0, 0, 0);
    return date.toISOString();
  })() : null;

  const fetchWeather = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Build API URL with optional date range for planned flight time
      let apiUrl = `/api/weather?latitude=${selectedAerodrome.latitude}&longitude=${selectedAerodrome.longitude}`;
      
      if (plannedFlightTime) {
        // Calculate date range: same day as planned time (API requires same start/end date or range)
        // datetime-local gives us local time, we need to convert to Europe/London timezone
        const plannedDate = new Date(plannedFlightTime);
        
        // Get the date in Europe/London timezone
        const londonDate = new Date(plannedDate.toLocaleString('en-US', { timeZone: 'Europe/London' }));
        const startDate = new Date(londonDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(londonDate);
        endDate.setHours(23, 59, 59, 999);
        
        // Format dates as YYYY-MM-DD (in London timezone)
        const year = startDate.getFullYear();
        const month = String(startDate.getMonth() + 1).padStart(2, '0');
        const day = String(startDate.getDate()).padStart(2, '0');
        const startDateStr = `${year}-${month}-${day}`;
        
        const endYear = endDate.getFullYear();
        const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
        const endDay = String(endDate.getDate()).padStart(2, '0');
        const endDateStr = `${endYear}-${endMonth}-${endDay}`;
        
        apiUrl += `&start_date=${startDateStr}&end_date=${endDateStr}`;
      }
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch weather data (${response.status})`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      if (!data.current_weather || !data.hourly) {
        throw new Error('Invalid weather data received from API');
      }
      setWeatherData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedAerodrome, selectedDay, selectedHour]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const currentWeather = weatherData?.current_weather;
  const hourly = weatherData?.hourly;
  
  // Find the closest hourly data point to planned flight time or current weather time
  let currentIndex = 0;
  let targetTime: Date | null = null;
  
  if (plannedFlightTime) {
    // Convert the planned flight time to match API timezone (Europe/London)
    // The datetime-local input gives us local time, but API returns times in Europe/London
    const plannedDate = new Date(plannedFlightTime);
    // Create a date string in London timezone format (YYYY-MM-DDTHH:00)
    const londonTime = new Date(plannedDate.toLocaleString('en-US', { timeZone: 'Europe/London' }));
    const year = londonTime.getFullYear();
    const month = String(londonTime.getMonth() + 1).padStart(2, '0');
    const day = String(londonTime.getDate()).padStart(2, '0');
    const hour = String(londonTime.getHours()).padStart(2, '0');
    const targetTimeStr = `${year}-${month}-${day}T${hour}:00`;
    targetTime = new Date(targetTimeStr + '+00:00'); // API returns times in UTC but with Europe/London timezone
  } else if (hourly?.time && currentWeather?.time) {
    targetTime = new Date(currentWeather.time);
  }
  
  let timeDifference: number | null = null;
  
  if (hourly?.time && targetTime) {
    // API returns times in ISO format, match them directly
    const targetTimeStr = targetTime.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
    
    // Find the exact match or closest hour
    let exactMatch = -1;
    hourly.time.forEach((time, index) => {
      const timeStr = new Date(time).toISOString().slice(0, 16);
      if (timeStr === targetTimeStr) {
        exactMatch = index;
      }
    });
    
    if (exactMatch >= 0) {
      currentIndex = exactMatch;
      timeDifference = 0;
    } else {
      // Find closest match
      const targetTimeMs = targetTime.getTime();
      const timeDiffs = hourly.time.map((time) => 
        Math.abs(new Date(time).getTime() - targetTimeMs)
      );
      const minDiff = Math.min(...timeDiffs);
      currentIndex = timeDiffs.indexOf(minDiff);
      if (currentIndex === -1) currentIndex = 0;
      
      // Calculate time difference in hours
      timeDifference = minDiff / (1000 * 60 * 60); // Convert ms to hours
    }
  }
  
  // Get the selected time's weather data
  const selectedTime = hourly?.time[currentIndex];
  const isPlannedTime = plannedFlightTime !== null;
  
  // Check if the selected time is within reasonable range (within 1 hour)
  const isAccurateForecast = timeDifference === null || timeDifference <= 1;

  const currentVisibility = hourly?.visibility[currentIndex] ?? 0;
  const currentPrecipitation = hourly?.precipitation[currentIndex] ?? 0;
  const currentCloudCover = hourly?.cloudcover[currentIndex] ?? 0;
  const currentCloudCoverLow = hourly?.cloudcover_low[currentIndex] ?? 0;
  const currentCloudCoverMid = hourly?.cloudcover_mid[currentIndex] ?? 0;
  const currentCloudCoverHigh = hourly?.cloudcover_high[currentIndex] ?? 0;
  const currentTemperature = hourly?.temperature_2m[currentIndex] ?? 0;
  const currentHumidity = hourly?.relativehumidity_2m[currentIndex] ?? 0;
  const currentDewpoint = hourly?.dewpoint_2m?.[currentIndex] ?? (currentTemperature - ((100 - currentHumidity) / 5));
  const currentApparentTemp = hourly?.apparent_temperature?.[currentIndex] ?? currentTemperature;
  const currentSurfacePressure = hourly?.surface_pressure?.[currentIndex] ?? 0;
  const currentQNH = hourly?.pressure_msl?.[currentIndex] ?? 0;  // QNH = Mean Sea Level Pressure
  const currentPrecipProb = hourly?.precipitation_probability?.[currentIndex] ?? 0;

  // Calculate cloud base
  const dewPoint = currentTemperature - ((100 - currentHumidity) / 5);
  const cloudBaseFeet = Math.max(0, (currentTemperature - dewPoint) * 400);

  return (
    <div className="container">
      <header className="header">
        <h1>✈️ Aerodrome Weather</h1>
        <p className="subtitle">Aviation weather information for UK aerodromes</p>
      </header>

      <div className="aerodrome-selector">
        <div className="selector-row">
          <div className="selector-group">
            <label htmlFor="aerodrome-select">Select Aerodrome:</label>
            <select
              id="aerodrome-select"
              value={selectedAerodrome.name}
              onChange={(e) => {
                const aerodrome = UK_AERODROMES.find((a) => a.name === e.target.value);
                if (aerodrome) setSelectedAerodrome(aerodrome);
              }}
              disabled={loading}
            >
              {UK_AERODROMES.map((aerodrome) => (
                <option key={aerodrome.name} value={aerodrome.name}>
                  {aerodrome.name} {aerodrome.icao && `(${aerodrome.icao})`}
                </option>
              ))}
            </select>
          </div>
          
          <div className="selector-group day-hour-picker">
            <label>Planned Flight Time (Optional):</label>
            <div className="day-hour-controls">
              <select
                id="flight-day"
                value={selectedDay ?? ''}
                onChange={(e) => setSelectedDay(e.target.value === '' ? null : Number(e.target.value))}
                disabled={loading}
              >
                <option value="">Now</option>
                {getDayOptions().map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
              <select
                id="flight-hour"
                value={selectedHour}
                onChange={(e) => setSelectedHour(Number(e.target.value))}
                disabled={loading || selectedDay === null}
                className={selectedDay === null ? 'disabled-select' : ''}
              >
                {getHourOptions().map((hour) => (
                  <option key={hour.value} value={hour.value}>
                    {hour.label}
                  </option>
                ))}
              </select>
              {selectedDay !== null && (
                <button
                  onClick={() => {
                    setSelectedDay(null);
                    setSelectedHour(12);
                  }}
                  className="clear-time-btn"
                  disabled={loading}
                  title="Clear planned flight time"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="aircraft-selector">
          <label>Aircraft Type:</label>
          <div className="aircraft-buttons">
            {AIRCRAFT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setAircraftType(option.value)}
                className={`aircraft-btn ${aircraftType === option.value ? 'active' : ''}`}
                disabled={loading}
              >
                <span className="aircraft-icon">{option.icon}</span>
                <span className="aircraft-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <button onClick={fetchWeather} disabled={loading} className="refresh-btn">
          {loading ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && !weatherData && (
        <div className="loading">Loading weather data...</div>
      )}

      {weatherData && currentWeather && (
        <>
          <FlightDecision
            windSpeed={hourly?.windspeed_10m[currentIndex] ?? 0}
            visibility={currentVisibility}
            cloudCover={currentCloudCover}
            cloudBase={cloudBaseFeet}
            precipitation={currentPrecipitation}
            aircraftType={aircraftType}
          />

          <div className="weather-overview">
            <div className="location-info">
              <h2>{selectedAerodrome.name}</h2>
              {selectedAerodrome.icao && (
                <p className="icao-code">{selectedAerodrome.icao}</p>
              )}
              <p className="timestamp">
                {isPlannedTime ? (
                  <>
                    <strong>Planned Flight Time:</strong>{' '}
                    {plannedFlightTime ? new Date(plannedFlightTime).toLocaleString('en-GB', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : 'N/A'}
                    <br />
                    <strong>Forecast Time:</strong>{' '}
                    {selectedTime ? new Date(selectedTime).toLocaleString('en-GB', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : 'N/A'}
                    <br />
                    <span className="forecast-note">(Forecast data)</span>
                    {!isAccurateForecast && timeDifference !== null && timeDifference > 0 && (
                      <>
                        <br />
                        <span className="forecast-warning-note">
                          ⚠️ Nearest forecast: {timeDifference.toFixed(1)} hours from selected time
                        </span>
                      </>
                    )}
                    {isAccurateForecast && (
                      <>
                        <br />
                        <span className="forecast-accurate-note">
                          ✅ Forecast data matches selected time
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <strong>Current Conditions:</strong>{' '}
                    {new Date(currentWeather.time).toLocaleString('en-GB')}
                  </>
                )}
              </p>
            </div>

            <div className="main-weather">
              <WeatherCard
                title="Temperature"
                value={Math.round(currentTemperature)}
                unit="°C"
                icon="🌡️"
              />
              <WeatherCard
                title="Feels Like"
                value={Math.round(currentApparentTemp)}
                unit="°C"
                icon="🤒"
              />
              <WeatherCard
                title="Visibility"
                value={(currentVisibility / 1000).toFixed(1)}
                unit="km"
                icon="👁️"
              />
              <WeatherCard
                title="Humidity"
                value={Math.round(currentHumidity)}
                unit="%"
                icon="💧"
              />
              <WeatherCard
                title="Dew Point"
                value={Math.round(currentDewpoint)}
                unit="°C"
                icon="💦"
              />
              <WeatherCard
                title="QNH"
                value={Math.round(currentQNH)}
                unit="hPa"
                icon="📊"
              />
              <WeatherCard
                title="Surface Pressure"
                value={Math.round(currentSurfacePressure)}
                unit="hPa"
                icon="⬇️"
              />
              <WeatherCard
                title="Rain Probability"
                value={Math.round(currentPrecipProb)}
                unit="%"
                icon="🌧️"
              />
            </div>
            
            {isPlannedTime && selectedTime && (
              <div className="forecast-warning">
                <strong>⚠️ Forecast Data:</strong> Weather shown is forecast for your planned flight time. 
                Conditions may change. Always check current METAR/TAF before flight.
              </div>
            )}
          </div>

          <section className="weather-section">
            <h2>Wind Conditions</h2>
            <WindDisplay
              speed={hourly?.windspeed_10m[currentIndex] ?? 0}
              direction={hourly?.winddirection_10m[currentIndex] ?? 0}
              gusts={hourly?.windgusts_10m[currentIndex]}
            />
          </section>

          <section className="weather-section">
            <h2>Cloud Conditions</h2>
            <CloudBaseDisplay
              cloudCover={currentCloudCover}
              cloudCoverLow={currentCloudCoverLow}
              cloudCoverMid={currentCloudCoverMid}
              cloudCoverHigh={currentCloudCoverHigh}
              temperature={currentTemperature}
              humidity={currentHumidity}
            />
          </section>

          <MetarTafPanel
            icao={selectedAerodrome.icao}
            aerodromeName={selectedAerodrome.name}
          />

          <DebugPanel
            data={weatherData}
            title="Raw Forecast Data"
          />
        </>
      )}

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }

        .header {
          text-align: center;
          color: white;
          margin-bottom: 2rem;
          padding: 2rem 0;
        }

        .header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .subtitle {
          font-size: 1.125rem;
          opacity: 0.9;
        }

        .aerodrome-selector {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .selector-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .selector-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .selector-group label {
          font-weight: 600;
          color: #333;
          font-size: 0.875rem;
        }

        .aerodrome-selector select {
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          background: white;
          cursor: pointer;
          transition: border-color 0.2s;
          width: 100%;
        }

        .aerodrome-selector select:hover {
          border-color: #667eea;
        }

        .aerodrome-selector select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .selector-group {
          position: relative;
        }

        .day-hour-picker .day-hour-controls {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .day-hour-picker select {
          flex: 1;
          min-width: 100px;
        }

        .day-hour-picker select:first-child {
          flex: 2;
        }

        .day-hour-picker .disabled-select {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .clear-time-btn {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          transition: background 0.2s;
        }

        .clear-time-btn:hover:not(:disabled) {
          background: #dc2626;
        }

        .clear-time-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .timezone-note {
          display: block;
          font-size: 0.75rem;
          color: #666;
          margin-top: 0.25rem;
          font-style: italic;
        }

        .aircraft-selector {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .aircraft-selector label {
          font-weight: 600;
          color: #333;
          font-size: 0.875rem;
        }

        .aircraft-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .aircraft-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
          font-weight: 500;
          color: #555;
        }

        .aircraft-btn:hover:not(:disabled) {
          border-color: #667eea;
          background: #f8f9ff;
        }

        .aircraft-btn.active {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }

        .aircraft-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .aircraft-icon {
          font-size: 1.25rem;
        }

        .aircraft-label {
          white-space: nowrap;
        }

        @media (max-width: 640px) {
          .aircraft-buttons {
            flex-direction: column;
          }
          .aircraft-btn {
            justify-content: center;
          }
        }

        .refresh-btn {
          padding: 0.75rem 1.5rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .refresh-btn:hover:not(:disabled) {
          background: #5568d3;
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border: 1px solid #fecaca;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: white;
          font-size: 1.25rem;
        }

        .weather-overview {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .location-info {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .location-info h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .icao-code {
          font-size: 1.25rem;
          color: #667eea;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .timestamp {
          font-size: 0.875rem;
          color: #666;
        }

        .forecast-note {
          font-size: 0.75rem;
          color: #f59e0b;
          font-weight: 600;
        }

        .forecast-warning {
          background: #fef3c7;
          border: 2px solid #f59e0b;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
          color: #92400e;
        }

        .forecast-warning strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .main-weather {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .weather-section {
          margin-bottom: 2rem;
        }

        .weather-section h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        }

        @media (min-width: 768px) {
          .selector-row {
            grid-template-columns: 1fr 1fr;
            align-items: end;
          }

          .header h1 {
            font-size: 3rem;
          }
        }
      `}</style>
    </div>
  );
}

