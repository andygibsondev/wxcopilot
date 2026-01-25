'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { WeatherData } from '@/types/weather';
import { UK_AERODROMES } from '@/data/aerodromes';
import { WeatherCard } from '@/components/WeatherCard';
import { WindDisplay } from '@/components/WindDisplay';
import { CloudBaseDisplay } from '@/components/CloudBaseDisplay';
import { FlightDecision } from '@/components/FlightDecision';
import { MetarTafPanel } from '@/components/MetarTafPanel';
import { LoadingScreen } from '@/components/LoadingScreen';

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
  { value: 'microlight', label: 'Microlight', icon: '🛫' },
];

// LocalStorage keys
const STORAGE_KEYS = {
  DEFAULT_AERODROME: 'wxcopilot_default_aerodrome',
  DEFAULT_AIRCRAFT: 'wxcopilot_default_aircraft',
};

export default function Home() {
  const [selectedAerodrome, setSelectedAerodrome] = useState(UK_AERODROMES[0]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedHour, setSelectedHour] = useState<number>(12); // Default to noon
  const [aircraftType, setAircraftType] = useState<AircraftType>('light');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [hasDefaults, setHasDefaults] = useState(false);
  const [defaultsSaved, setDefaultsSaved] = useState(false);
  const [shouldAutoFetch, setShouldAutoFetch] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [activePanel, setActivePanel] = useState(0);
  const swipeContainerRef = useRef<HTMLDivElement>(null);

  const PANELS = [
    { id: 'decision', label: 'Decision', icon: '✈️' },
    { id: 'conditions', label: 'Conditions', icon: '🌤️' },
    { id: 'wind', label: 'Wind', icon: '💨' },
    { id: 'clouds', label: 'Clouds', icon: '☁️' },
    { id: 'airfield', label: 'Airfield', icon: '🗺️' },
  ];

  // Load saved preferences from localStorage
  useEffect(() => {
    try {
      const savedAerodrome = localStorage.getItem(STORAGE_KEYS.DEFAULT_AERODROME);
      const savedAircraft = localStorage.getItem(STORAGE_KEYS.DEFAULT_AIRCRAFT);
      let foundDefaults = false;

      if (savedAerodrome) {
        const aerodrome = UK_AERODROMES.find(a => a.name === savedAerodrome);
        if (aerodrome) {
          setSelectedAerodrome(aerodrome);
          foundDefaults = true;
        }
      }

      if (savedAircraft && ['light', 'microlight', 'jet'].includes(savedAircraft)) {
        setAircraftType(savedAircraft as AircraftType);
        foundDefaults = true;
      }

      setHasDefaults(foundDefaults);
      setShouldAutoFetch(foundDefaults);
      setPrefsLoaded(true);
    } catch (e) {
      console.error('Error loading preferences:', e);
      setPrefsLoaded(true);
    }
  }, []);

  // Save current selection as defaults
  const saveAsDefaults = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.DEFAULT_AERODROME, selectedAerodrome.name);
      localStorage.setItem(STORAGE_KEYS.DEFAULT_AIRCRAFT, aircraftType);
      setHasDefaults(true);
      setDefaultsSaved(true);
      setTimeout(() => setDefaultsSaved(false), 2000);
    } catch (e) {
      console.error('Error saving preferences:', e);
    }
  };

  // Clear saved defaults
  const clearDefaults = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.DEFAULT_AERODROME);
      localStorage.removeItem(STORAGE_KEYS.DEFAULT_AIRCRAFT);
      setHasDefaults(false);
    } catch (e) {
      console.error('Error clearing preferences:', e);
    }
  };

  // Initial app loading
  useEffect(() => {
    // Simulate minimum loading time for splash screen
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to panel by index
  const scrollToPanel = (index: number) => {
    if (swipeContainerRef.current) {
      const panelWidth = swipeContainerRef.current.offsetWidth;
      swipeContainerRef.current.scrollTo({
        left: index * panelWidth,
        behavior: 'smooth'
      });
      // Scroll the target panel to top when tapping tab button
      const targetPanel = swipeContainerRef.current.children[index] as HTMLElement;
      if (targetPanel) {
        targetPanel.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    setActivePanel(index);
    setIsMenuOpen(false);
  };

  // Handle scroll event to update active panel indicator
  const handleScroll = () => {
    if (swipeContainerRef.current) {
      const scrollLeft = swipeContainerRef.current.scrollLeft;
      const panelWidth = swipeContainerRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / panelWidth);
      if (newIndex !== activePanel && newIndex >= 0 && newIndex < PANELS.length) {
        setActivePanel(newIndex);
      }
    }
  };

  // Legacy scroll function for menu (now uses panels)
  const scrollToSection = (id: string) => {
    const panelIndex = PANELS.findIndex(p => p.id === id);
    if (panelIndex >= 0) {
      scrollToPanel(panelIndex);
    }
    setIsMenuOpen(false);
  };

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
      setIsPanelCollapsed(true); // Collapse panel after successful fetch
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedAerodrome, selectedDay, selectedHour]);

  // Auto-fetch weather if defaults are loaded (only on initial load)
  useEffect(() => {
    if (!isAppLoading && prefsLoaded && shouldAutoFetch) {
      fetchWeather();
      setShouldAutoFetch(false); // Only auto-fetch once
      setIsPanelCollapsed(true); // Collapse the panel after auto-search
    }
  }, [isAppLoading, prefsLoaded, shouldAutoFetch, fetchWeather]);

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

  // Show loading screen on initial load
  if (isAppLoading) {
    return <LoadingScreen message="Preparing your flight data..." />;
  }

  return (
    <>
      {/* Fixed header bar at top */}
      <header className="fixed-header">
        <div className="fixed-header-content">
          <Image 
            src="/wxcopilot.jpg" 
            alt="WxCoPilot" 
            width={140} 
            height={50}
            className="header-logo-img"
            priority
          />
        </div>
        <button 
          className="hamburger-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
        </button>
      </header>

      {/* Navigation Menu Overlay */}
      {isMenuOpen && (
        <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}>
          <nav className="menu-nav" onClick={(e) => e.stopPropagation()}>
            <button className="menu-item" onClick={() => scrollToSection('search-section')}>
              <span className="menu-icon">🔍</span>
              <span>Search</span>
            </button>
            <button className="menu-item" onClick={() => scrollToSection('decision-section')}>
              <span className="menu-icon">✅</span>
              <span>Flight Decision</span>
            </button>
            <button className="menu-item" onClick={() => scrollToSection('conditions-section')}>
              <span className="menu-icon">🌤️</span>
              <span>Conditions</span>
            </button>
            <button className="menu-item" onClick={() => scrollToSection('wind-section')}>
              <span className="menu-icon">💨</span>
              <span>Wind</span>
            </button>
            <button className="menu-item" onClick={() => scrollToSection('cloud-section')}>
              <span className="menu-icon">☁️</span>
              <span>Clouds</span>
            </button>
            <button className="menu-item" onClick={() => scrollToSection('metar-section')}>
              <span className="menu-icon">📋</span>
              <span>METAR/TAF</span>
            </button>
          </nav>
        </div>
      )}

      <div className={`container ${isPanelCollapsed ? 'has-collapsed-panel' : ''}`}>

      <div id="search-section" className={`aerodrome-selector ${isPanelCollapsed ? 'collapsed' : ''}`}>
        {/* Collapsed Summary Header */}
        {isPanelCollapsed && weatherData && (
          <button 
            className="collapsed-header"
            onClick={() => setIsPanelCollapsed(false)}
          >
            <div className="collapsed-info">
              <span className="collapsed-aerodrome">
                📍 {selectedAerodrome.name}
                {selectedAerodrome.icao && <span className="collapsed-icao">({selectedAerodrome.icao})</span>}
              </span>
              <span className="collapsed-details">
                {AIRCRAFT_OPTIONS.find(a => a.value === aircraftType)?.icon}{' '}
                {selectedDay !== null 
                  ? `${getDayOptions()[selectedDay]?.label} ${String(selectedHour).padStart(2, '0')}:00`
                  : 'Now'
                }
              </span>
            </div>
            <span className="expand-icon">▼ Change</span>
          </button>
        )}

        {/* Expanded Panel Content */}
        {!isPanelCollapsed && (
          <>
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
              {loading ? 'Loading...' : '🔄 Get Weather'}
            </button>

            {/* Default Settings */}
            <div className="defaults-section">
              <button 
                onClick={saveAsDefaults} 
                className={`save-defaults-btn ${defaultsSaved ? 'saved' : ''}`}
                disabled={loading}
              >
                {defaultsSaved ? '✓ Saved!' : '⭐ Set as My Default'}
              </button>
              {hasDefaults && (
                <button 
                  onClick={clearDefaults} 
                  className="clear-defaults-btn"
                  disabled={loading}
                >
                  Clear Defaults
                </button>
              )}
            </div>
          </>
        )}
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
          {/* Swipeable Panels Container */}
          <div 
            className="swipe-container"
            ref={swipeContainerRef}
            onScroll={handleScroll}
          >
            {/* Panel 1: Flight Decision */}
            <div className="swipe-panel" id="panel-decision">
              <section className="weather-section">
                <h2>✈️ Flight Decision</h2>
              </section>
              <FlightDecision
                windSpeed={hourly?.windspeed_10m[currentIndex] ?? 0}
                visibility={currentVisibility}
                cloudCover={currentCloudCover}
                cloudBase={cloudBaseFeet}
                precipitation={currentPrecipitation}
                aircraftType={aircraftType}
              />
            </div>

            {/* Panel 2: Weather Conditions */}
            <div className="swipe-panel" id="panel-conditions">
              <section className="weather-section">
                <h2>🌤️ Weather Conditions</h2>
              </section>
              <div className="weather-overview">
                <div className="location-info">
                  <h3>{selectedAerodrome.name}</h3>
                  {selectedAerodrome.icao && (
                    <p className="icao-code">{selectedAerodrome.icao}</p>
                  )}
                  <p className="timestamp">
                    {isPlannedTime ? (
                      <>
                        <strong>Planned:</strong>{' '}
                        {plannedFlightTime ? new Date(plannedFlightTime).toLocaleString('en-GB', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : 'N/A'}
                        {isAccurateForecast && <span className="forecast-accurate-note"> ✅</span>}
                        {!isAccurateForecast && timeDifference !== null && timeDifference > 0 && (
                          <span className="forecast-warning-note"> ⚠️ ±{timeDifference.toFixed(1)}h</span>
                        )}
                      </>
                    ) : (
                      <>
                        <strong>Now:</strong>{' '}
                        {new Date(currentWeather.time).toLocaleString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </>
                    )}
                  </p>
                </div>

                <div className="main-weather">
                  <WeatherCard title="Temperature" value={Math.round(currentTemperature)} unit="°C" icon="🌡️" />
                  <WeatherCard title="Feels Like" value={Math.round(currentApparentTemp)} unit="°C" icon="🤒" />
                  <WeatherCard title="Visibility" value={(currentVisibility / 1000).toFixed(1)} unit="km" icon="👁️" />
                  <WeatherCard title="Humidity" value={Math.round(currentHumidity)} unit="%" icon="💧" />
                  <WeatherCard title="Dew Point" value={Math.round(currentDewpoint)} unit="°C" icon="💦" />
                  <WeatherCard title="QNH" value={Math.round(currentQNH)} unit="hPa" icon="📊" />
                  <WeatherCard title="Surface Pressure" value={Math.round(currentSurfacePressure)} unit="hPa" icon="⬇️" />
                  <WeatherCard title="Rain Probability" value={Math.round(currentPrecipProb)} unit="%" icon="🌧️" />
                </div>
              </div>
            </div>

            {/* Panel 3: Wind Conditions */}
            <div className="swipe-panel" id="panel-wind">
              <section className="weather-section">
                <h2>💨 Wind Conditions</h2>
                <WindDisplay
                  speed={hourly?.windspeed_10m[currentIndex] ?? 0}
                  direction={hourly?.winddirection_10m[currentIndex] ?? 0}
                  gusts={hourly?.windgusts_10m[currentIndex]}
                />
              </section>
            </div>

            {/* Panel 4: Cloud Conditions */}
            <div className="swipe-panel" id="panel-clouds">
              <section className="weather-section">
                <h2>☁️ Cloud Conditions</h2>
                <CloudBaseDisplay
                  cloudCover={currentCloudCover}
                  cloudCoverLow={currentCloudCoverLow}
                  cloudCoverMid={currentCloudCoverMid}
                  cloudCoverHigh={currentCloudCoverHigh}
                  temperature={currentTemperature}
                  humidity={currentHumidity}
                />
              </section>
            </div>

            {/* Panel 5: Airfield Information & METAR/TAF */}
            <div className="swipe-panel" id="panel-airfield">
              <section className="weather-section airfield-section">
                <h2>🗺️ Airfield Information</h2>
                
                <div className="airfield-details">
                  <div className="airfield-header">
                    <h3>{selectedAerodrome.name}</h3>
                    {selectedAerodrome.icao && (
                      <span className="airfield-icao">{selectedAerodrome.icao}</span>
                    )}
                  </div>

                  <div className="airfield-stats">
                    <div className="stat-item">
                      <span className="stat-label">Latitude</span>
                      <span className="stat-value">{selectedAerodrome.latitude.toFixed(4)}°</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Longitude</span>
                      <span className="stat-value">{selectedAerodrome.longitude.toFixed(4)}°</span>
                    </div>
                    {selectedAerodrome.icao && (
                      <div className="stat-item">
                        <span className="stat-label">ICAO Code</span>
                        <span className="stat-value">{selectedAerodrome.icao}</span>
                      </div>
                    )}
                    <div className="stat-item">
                      <span className="stat-label">Type</span>
                      <span className="stat-value">
                        {selectedAerodrome.icao?.startsWith('EG') ? 'UK Aerodrome' : 'Airfield'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="airfield-map">
                  <iframe
                    title="Airfield Map"
                    width="100%"
                    height="300"
                    style={{ border: 0, borderRadius: '12px' }}
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedAerodrome.longitude - 0.05}%2C${selectedAerodrome.latitude - 0.03}%2C${selectedAerodrome.longitude + 0.05}%2C${selectedAerodrome.latitude + 0.03}&layer=mapnik&marker=${selectedAerodrome.latitude}%2C${selectedAerodrome.longitude}`}
                  />
                  <a 
                    href={`https://www.openstreetmap.org/?mlat=${selectedAerodrome.latitude}&mlon=${selectedAerodrome.longitude}#map=14/${selectedAerodrome.latitude}/${selectedAerodrome.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    🔗 View larger map
                  </a>
                </div>

                <div className="airfield-links">
                  {selectedAerodrome.icao && (
                    <>
                      <a 
                        href={`https://skyvector.com/airport/${selectedAerodrome.icao}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="airfield-link"
                      >
                        📊 SkyVector Charts
                      </a>
                      <a 
                        href={`https://www.flightradar24.com/airport/${selectedAerodrome.icao.toLowerCase()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="airfield-link"
                      >
                        ✈️ FlightRadar24
                      </a>
                    </>
                  )}
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedAerodrome.latitude},${selectedAerodrome.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="airfield-link"
                  >
                    🗺️ Google Maps
                  </a>
                </div>

                {/* METAR/TAF Section */}
                <div className="airfield-metar">
                  <MetarTafPanel
                    icao={selectedAerodrome.icao}
                    aerodromeName={selectedAerodrome.name}
                  />
                </div>
              </section>
            </div>
          </div>

          {/* Bottom Tab Bar */}
          <nav className="bottom-tab-bar">
            {PANELS.map((panel, index) => (
              <button
                key={panel.id}
                className={`bottom-tab ${activePanel === index ? 'active' : ''}`}
                onClick={() => scrollToPanel(index)}
                aria-label={`Go to ${panel.label}`}
              >
                <span className="bottom-tab-icon">{panel.icon}</span>
                <span className="bottom-tab-label">{panel.label}</span>
                {activePanel === index && <span className="bottom-tab-indicator" />}
              </button>
            ))}
          </nav>
        </>
      )}

      <style jsx>{`
        /* ========================================
           MODERN GLASSMORPHISM DESIGN
           ======================================== */

        /* Glassmorphism card */
        .aerodrome-selector {
          position: relative;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: var(--radius-xl, 24px);
          padding: 1.25rem;
          margin-bottom: 1.25rem;
          box-shadow: 
            0 4px 30px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.3);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: all var(--transition-slow, 300ms) ease;
        }

        /* Collapsed state */
        .aerodrome-selector.collapsed {
          position: fixed;
          top: calc(3.5rem + env(safe-area-inset-top));
          left: 0;
          right: 0;
          width: 100%;
          z-index: 999;
          padding: 0;
          gap: 0;
          margin-bottom: 0;
          border-radius: 0;
          box-shadow: none;
        }

        .collapsed-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: none;
          border-radius: 0;
          cursor: pointer;
          transition: all var(--transition-base, 200ms);
          -webkit-tap-highlight-color: transparent;
        }

        .collapsed-header:active {
          background: rgba(248, 250, 252, 0.95);
        }

        .collapsed-info {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .collapsed-aerodrome {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-text, #1e293b);
        }

        .collapsed-icao {
          font-weight: 600;
          color: var(--color-primary, #6366f1);
          margin-left: 0.25rem;
        }

        .collapsed-details {
          font-size: 0.75rem;
          color: var(--color-text-muted, #64748b);
          font-weight: 500;
        }

        .expand-icon {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-primary, #6366f1);
          padding: 0.375rem 0.625rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border-radius: var(--radius-full, 9999px);
          white-space: nowrap;
          transition: all var(--transition-fast, 150ms);
        }

        .selector-row {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .selector-group {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          position: relative;
        }

        .selector-group label {
          font-weight: 600;
          color: var(--color-text-muted, #64748b);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* Modern selects */
        .aerodrome-selector select {
          padding: 1rem 1.25rem;
          border: 2px solid rgba(0, 0, 0, 0.08);
          border-radius: var(--radius-lg, 16px);
          font-size: 1rem;
          font-weight: 500;
          background: rgba(248, 250, 252, 0.8);
          color: var(--color-text, #1e293b);
          cursor: pointer;
          transition: all var(--transition-fast, 150ms);
          width: 100%;
          -webkit-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236366f1' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1.25rem center;
          padding-right: 3rem;
        }

        .aerodrome-selector select:focus {
          outline: none;
          border-color: var(--color-primary, #6366f1);
          background: white;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
        }

        /* Day/hour picker */
        .day-hour-picker .day-hour-controls {
          display: flex;
          gap: 0.625rem;
          align-items: center;
        }

        .day-hour-picker select {
          flex: 1;
          min-width: 0;
        }

        .day-hour-picker select:first-child {
          flex: 1.5;
        }

        .day-hour-picker .disabled-select {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .clear-time-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          border-radius: var(--radius-full, 9999px);
          width: 44px;
          height: 44px;
          min-height: 44px;
          flex-shrink: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: bold;
          transition: all var(--transition-fast, 150ms);
          -webkit-tap-highlight-color: transparent;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }

        .clear-time-btn:active {
          transform: scale(0.92);
        }

        .clear-time-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .timezone-note {
          display: block;
          font-size: 0.75rem;
          color: var(--color-text-muted, #64748b);
          margin-top: 0.25rem;
          font-style: italic;
        }

        /* Aircraft type buttons */
        .aircraft-selector {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        .aircraft-selector label {
          font-weight: 600;
          color: var(--color-text-muted, #64748b);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .aircraft-buttons {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.625rem;
        }

        .aircraft-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border: 2px solid rgba(0, 0, 0, 0.06);
          border-radius: var(--radius-lg, 16px);
          background: rgba(248, 250, 252, 0.8);
          cursor: pointer;
          transition: all var(--transition-fast, 150ms);
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text, #1e293b);
          -webkit-tap-highlight-color: transparent;
        }

        .aircraft-btn:active:not(:disabled) {
          transform: scale(0.97);
        }

        .aircraft-btn.active {
          border-color: transparent;
          background: linear-gradient(135deg, var(--color-primary, #6366f1) 0%, var(--color-secondary, #8b5cf6) 100%);
          color: white;
          box-shadow: 
            0 4px 15px rgba(99, 102, 241, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .aircraft-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .aircraft-icon {
          font-size: 1.625rem;
        }

        .aircraft-label {
          white-space: nowrap;
        }

        /* Refresh button */
        .refresh-btn {
          width: 100%;
          padding: 1.125rem 1.5rem;
          background: linear-gradient(135deg, var(--color-primary, #6366f1) 0%, var(--color-secondary, #8b5cf6) 100%);
          color: white;
          border: none;
          border-radius: var(--radius-lg, 16px);
          font-size: 1.125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .refresh-btn:active:not(:disabled) {
          transform: scale(0.98);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Defaults Section */
        .defaults-section {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.75rem;
          flex-wrap: wrap;
        }

        .save-defaults-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          background: transparent;
          color: var(--color-primary, #6366f1);
          border: 2px solid var(--color-primary, #6366f1);
          border-radius: var(--radius-md, 12px);
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 150ms ease;
          -webkit-tap-highlight-color: transparent;
        }

        .save-defaults-btn:hover:not(:disabled) {
          background: rgba(99, 102, 241, 0.1);
        }

        .save-defaults-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .save-defaults-btn.saved {
          background: var(--color-success, #10b981);
          border-color: var(--color-success, #10b981);
          color: white;
        }

        .save-defaults-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .clear-defaults-btn {
          padding: 0.75rem 1rem;
          background: transparent;
          color: var(--color-text-muted, #64748b);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: var(--radius-md, 12px);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease;
          -webkit-tap-highlight-color: transparent;
        }

        .clear-defaults-btn:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.05);
          color: var(--color-danger, #ef4444);
          border-color: var(--color-danger, #ef4444);
        }

        .clear-defaults-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ========================================
           TABLET BREAKPOINT (768px+)
           ======================================== */
        @media (min-width: 768px) {
          .aerodrome-selector {
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .aerodrome-selector.collapsed {
            top: calc(4rem + env(safe-area-inset-top));
            left: 0;
            right: 0;
            width: 100%;
            max-width: none;
          }

          .collapsed-header {
            padding: 0.5rem 1.25rem;
          }

          .selector-row {
            flex-direction: row;
            gap: 1.5rem;
          }

          .selector-group {
            flex: 1;
          }

          .aircraft-buttons {
            grid-template-columns: repeat(3, 1fr);
          }

          .refresh-btn {
            width: auto;
            align-self: flex-start;
          }
        }

        /* ========================================
           DESKTOP BREAKPOINT (1024px+)
           ======================================== */
        @media (min-width: 1024px) {
          .header h1 {
            font-size: 2.5rem;
          }

          .aerodrome-selector {
            padding: 2rem;
          }
        }

        /* ========================================
           ERROR & LOADING STATES
           ======================================== */
        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1rem;
          border: 1px solid #fecaca;
          font-size: 0.875rem;
        }

        .loading {
          text-align: center;
          padding: 3rem 1rem;
          color: white;
          font-size: 1.125rem;
        }

        /* ========================================
           WEATHER OVERVIEW CARD
           ======================================== */
        .weather-overview {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: var(--radius-xl, 24px);
          padding: 1.25rem;
          margin-bottom: 1.25rem;
          box-shadow: 
            0 4px 30px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .location-info {
          text-align: center;
          margin-bottom: 1.25rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .location-info h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text, #1e293b);
          margin-bottom: 0.25rem;
          letter-spacing: -0.02em;
        }

        .icao-code {
          font-size: 1rem;
          color: var(--color-primary, #6366f1);
          font-weight: 700;
          margin-bottom: 0.625rem;
          letter-spacing: 0.05em;
        }

        .timestamp {
          font-size: 0.8125rem;
          color: var(--color-text-muted, #64748b);
          line-height: 1.6;
        }

        .forecast-note {
          font-size: 0.75rem;
          color: var(--color-warning, #f59e0b);
          font-weight: 600;
        }

        .forecast-warning-note {
          color: #dc2626;
          font-weight: 500;
        }

        .forecast-accurate-note {
          color: #059669;
          font-weight: 500;
        }

        .forecast-warning {
          background: #fef3c7;
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 0.875rem;
          margin-top: 1rem;
          color: #92400e;
          font-size: 0.875rem;
        }

        .forecast-warning strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        /* Weather cards grid - 2 columns on mobile */
        .main-weather {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        /* ========================================
           WEATHER SECTIONS
           ======================================== */
        .weather-section {
          margin-bottom: 1.25rem;
        }

        .weather-section h2 {
          font-size: 1.125rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }


        /* ========================================
           SWIPEABLE PANELS
           ======================================== */
        .swipe-container {
          display: flex;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          gap: 1rem;
          margin: 0;
          padding-left: 0.5rem;
          padding-right: 0.5rem;
          height: calc(100dvh - 8rem - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 4rem);
        }

        .swipe-container::-webkit-scrollbar {
          display: none;
        }

        .swipe-panel {
          flex: 0 0 98%;
          width: 98%;
          height: 100%;
          max-height: 100%;
          scroll-snap-align: center;
          scroll-snap-stop: always;
          padding: 0;
          padding-bottom: 5rem;
          box-sizing: border-box;
          overflow-y: scroll;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }

        .swipe-panel::-webkit-scrollbar {
          width: 4px;
        }

        .swipe-panel::-webkit-scrollbar-track {
          background: transparent;
        }

        .swipe-panel::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }

        /* ========================================
           BOTTOM TAB BAR
           ======================================== */
        .bottom-tab-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          display: flex;
          justify-content: space-around;
          align-items: stretch;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(6, 182, 212, 0.2);
          padding-bottom: env(safe-area-inset-bottom);
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
        }

        .bottom-tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          padding: 0.625rem 0.25rem;
          background: transparent;
          border: none;
          cursor: pointer;
          position: relative;
          transition: all 200ms ease;
          -webkit-tap-highlight-color: transparent;
        }

        .bottom-tab-icon {
          font-size: 1.25rem;
          transition: transform 200ms ease;
          filter: grayscale(0.5) opacity(0.6);
        }

        .bottom-tab-label {
          font-size: 0.625rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.02em;
          transition: color 200ms ease;
        }

        .bottom-tab-indicator {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 3px;
          background: linear-gradient(90deg, #06b6d4 0%, #22d3ee 100%);
          border-radius: 0 0 4px 4px;
          box-shadow: 0 2px 8px rgba(6, 182, 212, 0.5);
        }

        .bottom-tab.active .bottom-tab-icon {
          transform: scale(1.1);
          filter: grayscale(0) opacity(1);
        }

        .bottom-tab.active .bottom-tab-label {
          color: #06b6d4;
        }

        .bottom-tab:active:not(.active) {
          background: rgba(255, 255, 255, 0.05);
        }

        @media (min-width: 768px) {
          .bottom-tab-bar {
            max-width: 500px;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 20px 20px 0 0;
            border-left: 1px solid rgba(6, 182, 212, 0.2);
            border-right: 1px solid rgba(6, 182, 212, 0.2);
          }

          .bottom-tab {
            padding: 0.75rem 0.5rem;
          }

          .bottom-tab-icon {
            font-size: 1.375rem;
          }

          .bottom-tab-label {
            font-size: 0.6875rem;
          }
        }

        /* ========================================
           AIRFIELD INFORMATION PANEL
           ======================================== */
        .airfield-section {
          padding-bottom: 6rem;
        }

        .airfield-details {
          background: rgba(255, 255, 255, 0.95);
          border-radius: var(--radius-lg, 16px);
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .airfield-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .airfield-header h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-text, #1e293b);
          margin: 0;
        }

        .airfield-icao {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-primary, #6366f1);
          background: rgba(99, 102, 241, 0.1);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full, 9999px);
        }

        .airfield-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--color-text-muted, #64748b);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .stat-value {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--color-text, #1e293b);
        }

        .airfield-map {
          margin-bottom: 1rem;
        }

        .airfield-map iframe {
          display: block;
          width: 100%;
        }

        .map-link {
          display: block;
          text-align: center;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 0.5rem;
          text-decoration: none;
        }

        .map-link:hover {
          color: var(--color-accent, #06b6d4);
        }

        .airfield-links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .airfield-link {
          flex: 1;
          min-width: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md, 12px);
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.75rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 200ms ease;
        }

        .airfield-link:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .airfield-metar {
          margin-top: 1.5rem;
        }

        /* ========================================
           TABLET STYLES FOR WEATHER
           ======================================== */
        @media (min-width: 768px) {
          .weather-overview {
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .location-info {
            margin-bottom: 1.5rem;
            padding-bottom: 1.5rem;
          }

          .location-info h3 {
            font-size: 1.5rem;
          }

          .main-weather {
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
          }

          .weather-section {
            margin-bottom: 1.5rem;
          }

          .weather-section h2 {
            font-size: 1.375rem;
          }

          .swipe-container {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }

          .swipe-panel {
            flex: 0 0 98%;
            width: 98%;
          }
        }
      `}</style>
    </div>
    </>
  );
}

