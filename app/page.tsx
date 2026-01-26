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
import { AirfieldMap } from '@/components/AirfieldMap';
import { AddToHomeScreen } from '@/components/AddToHomeScreen';
import './page.css';

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
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [hasDefaults, setHasDefaults] = useState(false);
  const [defaultsSaved, setDefaultsSaved] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [activePanel, setActivePanel] = useState(0);
  const swipeContainerRef = useRef<HTMLDivElement>(null);
  const [aerodromeSearch, setAerodromeSearch] = useState('');
  const [showAerodromeList, setShowAerodromeList] = useState(false);
  const aerodromeSearchRef = useRef<HTMLInputElement>(null);
  const aerodromeResultsRef = useRef<HTMLDivElement>(null);
  const [currentView, setCurrentView] = useState<'main' | 'about' | 'contact'>('main');
  
  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullStartY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const PULL_THRESHOLD = 80; // Distance in pixels to trigger refresh

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

  // Filter aerodromes based on search query
  const filteredAerodromes = React.useMemo(() => {
    if (!aerodromeSearch.trim()) {
      return UK_AERODROMES;
    }
    const searchLower = aerodromeSearch.toLowerCase().trim();
    return UK_AERODROMES.filter(aerodrome => 
      aerodrome.name.toLowerCase().includes(searchLower) ||
      aerodrome.icao?.toLowerCase().includes(searchLower)
    );
  }, [aerodromeSearch]);

  // Handle aerodrome selection
  const handleAerodromeSelect = (aerodrome: typeof UK_AERODROMES[0]) => {
    setSelectedAerodrome(aerodrome);
    setAerodromeSearch('');
    // Keep list open so user can easily change selection
    // setShowAerodromeList(false);
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
  };

  // Handle scroll event to update active panel indicator
  const handleScroll = () => {
    if (swipeContainerRef.current) {
      const scrollLeft = swipeContainerRef.current.scrollLeft;
      const panelWidth = swipeContainerRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / panelWidth);
      if (newIndex !== activePanel && newIndex >= 0 && newIndex < PANELS.length) {
        setActivePanel(newIndex);
        // Scroll the newly active panel to top when swiping
        const targetPanel = swipeContainerRef.current.children[newIndex] as HTMLElement;
        if (targetPanel) {
          targetPanel.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  };

  // Legacy scroll function (now uses panels)
  const scrollToSection = (id: string) => {
    const panelIndex = PANELS.findIndex(p => p.id === id);
    if (panelIndex >= 0) {
      scrollToPanel(panelIndex);
    }
  };

  // Compute plannedFlightTime from day/hour selection
  const plannedFlightTime = selectedDay !== null ? (() => {
    const now = new Date();
    const date = new Date(now);
    date.setDate(date.getDate() + selectedDay);
    date.setHours(selectedHour, 0, 0, 0);
    return date.toISOString();
  })() : null;

  const fetchWeather = React.useCallback(async (shouldCollapse: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      // Build API URL with optional date range for planned flight time
      // Add cache-busting parameter to ensure fresh data on every load
      const cacheBuster = new Date().getTime();
      let apiUrl = `/api/weather?latitude=${selectedAerodrome.latitude}&longitude=${selectedAerodrome.longitude}&_t=${cacheBuster}`;
      
      // Compute plannedFlightTime inside the callback to ensure we use current values
      const currentPlannedFlightTime = selectedDay !== null ? (() => {
        const now = new Date();
        const date = new Date(now);
        date.setDate(date.getDate() + selectedDay);
        date.setHours(selectedHour, 0, 0, 0);
        return date.toISOString();
      })() : null;
      
      if (currentPlannedFlightTime) {
        // Calculate date range: same day as planned time (API requires same start/end date or range)
        // datetime-local gives us local time, we need to convert to Europe/London timezone
        const plannedDate = new Date(currentPlannedFlightTime);
        
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
      // Only collapse panel if explicitly requested (e.g., on initial load)
      if (shouldCollapse) {
        setIsPanelCollapsed(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedAerodrome, selectedDay, selectedHour]);

  // Auto-fetch weather on initial app load only (after preferences are loaded)
  const hasInitialFetched = useRef(false);
  useEffect(() => {
    if (!isAppLoading && prefsLoaded && !hasInitialFetched.current) {
      hasInitialFetched.current = true;
      fetchWeather(true); // Collapse panel on initial load
    }
  }, [isAppLoading, prefsLoaded, fetchWeather]);

  // Scroll to top of decision panel when search criteria changes
  const prevSearchCriteriaRef = useRef<{
    aerodrome: string;
    day: number | null;
    hour: number;
    aircraft: AircraftType;
  } | null>(null);

  useEffect(() => {
    // Only scroll if weather data exists (panels are rendered)
    if (weatherData && swipeContainerRef.current) {
      const currentCriteria = {
        aerodrome: selectedAerodrome.name,
        day: selectedDay,
        hour: selectedHour,
        aircraft: aircraftType,
      };

      // Check if search criteria actually changed (not initial load)
      if (prevSearchCriteriaRef.current) {
        const prev = prevSearchCriteriaRef.current;
        const hasChanged = 
          prev.aerodrome !== currentCriteria.aerodrome ||
          prev.day !== currentCriteria.day ||
          prev.hour !== currentCriteria.hour ||
          prev.aircraft !== currentCriteria.aircraft;

        if (hasChanged) {
          // Scroll to decision panel (index 0)
          swipeContainerRef.current.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
          
          // Scroll the decision panel to top
          const decisionPanel = swipeContainerRef.current.children[0] as HTMLElement;
          if (decisionPanel) {
            decisionPanel.scrollTo({ top: 0, behavior: 'smooth' });
          }
          
          // Update active panel indicator
          setActivePanel(0);
        }
      }

      // Update the ref for next comparison
      prevSearchCriteriaRef.current = currentCriteria;
    }
  }, [selectedAerodrome, selectedDay, selectedHour, aircraftType, weatherData]);

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

  // About Us View
  if (currentView === 'about') {
  return (
    <>
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
          className="info-btn"
          onClick={() => setCurrentView('about')}
          aria-label="About Us"
        >
          <img 
            src="/icons/icons8-info.svg" 
            alt="Info" 
            width={20} 
            height={20}
            style={{ display: 'block' }}
          />
        </button>
      </header>

        <div className="info-view">
          <div className="info-view-content">
            <button className="back-button" onClick={() => setCurrentView('main')}>
              ← Back
            </button>
            <h1>About Us</h1>
            <div className="info-section">
              <h2>Welcome to WxCoPilot</h2>
              <p>
                WxCoPilot is your trusted aviation weather companion, providing real-time weather data and flight decision support for UK aerodromes.
              </p>
              <p>
                Our mission is to help pilots make informed decisions by providing accurate, up-to-date weather information in an easy-to-understand format.
              </p>
            </div>
            <div className="info-section">
              <h2>Features</h2>
              <ul className="info-list">
                <li>Real-time weather data for UK aerodromes</li>
                <li>Flight decision support based on aircraft type</li>
                <li>Detailed weather conditions and forecasts</li>
                <li>METAR and TAF data interpretation</li>
                <li>Interactive maps and airfield information</li>
                <li>Mobile-optimized for use in the field</li>
              </ul>
            </div>
            <div className="info-section">
              <h2>Our Commitment</h2>
              <p>
                We are committed to providing pilots with the most accurate and up-to-date weather information to support safe flight operations. Our platform combines multiple data sources to give you a comprehensive view of current and forecasted conditions.
              </p>
            </div>
            <div className="info-section disclaimer-section">
              <h2>⚠️ Important Disclaimer</h2>
              <p>
                The information provided by WxCoPilot should be used with caution and is intended for planning purposes only. Weather conditions can change rapidly, and the data presented may not always reflect the most current conditions at your intended aerodrome.
              </p>
              <p>
                <strong>Pilots in Command</strong> are responsible for reviewing official aviation sources, including METARs, TAFs, NOTAMs, and other authoritative weather briefings as part of their flight planning process. This application is a supplementary tool and should not be used as the sole source of weather information for flight planning or decision-making.
              </p>
              <p>
                Always verify weather information through official channels before making any flight decisions. Safety is paramount in aviation, and proper weather assessment is a critical component of safe flight operations.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Contact View
  if (currentView === 'contact') {
    return (
      <>
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
            className="info-btn"
            onClick={() => setCurrentView('about')}
            aria-label="About Us"
          >
            ℹ️
            </button>
      </header>

        <div className="info-view">
          <div className="info-view-content">
            <button className="back-button" onClick={() => setCurrentView('main')}>
              ← Back
            </button>
            <h1>Contact</h1>
            <div className="info-section">
              <h2>Get in Touch</h2>
              <p>
                We'd love to hear from you! Whether you have questions, feedback, or suggestions, please don't hesitate to reach out.
              </p>
        </div>
            <div className="info-section">
              <div className="contact-card">
                <div className="contact-icon-large">📧</div>
                <div className="contact-info">
                  <h3>Email</h3>
                  <a href="mailto:contact@wxcopilot.com" className="contact-link-large">
                    contact@wxcopilot.com
                  </a>
                  <p className="contact-description">Send us an email and we'll get back to you as soon as possible.</p>
                </div>
              </div>
            </div>
            <div className="info-section">
              <div className="contact-card">
                <div className="contact-icon-large">🌐</div>
                <div className="contact-info">
                  <h3>Website</h3>
                  <a href="https://wxcopilot.com" target="_blank" rel="noopener noreferrer" className="contact-link-large">
                    wxcopilot.com
                  </a>
                  <p className="contact-description">Visit our website for more information and updates.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
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
          className="info-btn"
          onClick={() => setCurrentView('about')}
          aria-label="About Us"
        >
          <img 
            src="/icons/icons8-info.svg" 
            alt="Info" 
            width={20} 
            height={20}
            style={{ display: 'block' }}
          />
        </button>
      </header>


      {/* Pull-to-refresh indicator */}
      {(isPulling || isRefreshing) && weatherData && (
        <div 
          className="pull-to-refresh-indicator"
          style={{
            transform: `translateX(-50%) translateY(${Math.min(pullDistance - 20, PULL_THRESHOLD * 1.2)}px)`,
            opacity: Math.min(pullDistance / PULL_THRESHOLD, 1)
          }}
        >
          <div className="pull-to-refresh-icon">
            {isRefreshing ? (
              <span className="spinning">🔄</span>
            ) : pullDistance >= PULL_THRESHOLD ? (
              <span>⬇️</span>
            ) : (
              <span>⬇️</span>
            )}
          </div>
          <div className="pull-to-refresh-text">
            {isRefreshing 
              ? 'Refreshing...' 
              : pullDistance >= PULL_THRESHOLD 
                ? 'Release to refresh' 
                : 'Pull to refresh'
            }
          </div>
        </div>
      )}

      <div 
        className={`container ${isPanelCollapsed ? 'has-collapsed-panel' : ''} ${isPulling ? 'pulling' : ''}`}
        ref={containerRef}
        onTouchStart={(e) => {
          if (!weatherData || loading) return;
          const container = containerRef.current;
          if (!container) return;
          
          // Only allow pull-to-refresh when at the top of the page
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          if (scrollTop > 10) return;
          
          pullStartY.current = e.touches[0].clientY;
          setIsPulling(true);
        }}
        onTouchMove={(e) => {
          if (!isPulling || !weatherData || loading) return;
          
          const currentY = e.touches[0].clientY;
          const distance = Math.max(0, currentY - pullStartY.current);
          
          // Only allow downward pull
          if (distance > 0) {
            setPullDistance(distance);
            // Prevent default scrolling when pulling
            if (distance > 10) {
              e.preventDefault();
            }
          }
        }}
        onTouchEnd={() => {
          if (!isPulling) return;
          
          if (pullDistance >= PULL_THRESHOLD && !loading) {
            setIsRefreshing(true);
            fetchWeather(false).finally(() => {
              setIsRefreshing(false);
            });
          }
          
          setPullDistance(0);
          setIsPulling(false);
        }}
      >

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
              <div className="selector-group aerodrome-search-group">
                <label htmlFor="aerodrome-search">Search Aerodrome:</label>
                <div className="aerodrome-search-wrapper">
                  <input
                    ref={aerodromeSearchRef}
                    id="aerodrome-search"
                    type="text"
                    placeholder="Type name or ICAO code (e.g., EGLL, Heathrow)..."
                    value={aerodromeSearch}
                    onChange={(e) => {
                      setAerodromeSearch(e.target.value);
                      setShowAerodromeList(true);
                    }}
                    onFocus={() => setShowAerodromeList(true)}
                    onBlur={(e) => {
                      // Only hide if clicking outside the results list or search wrapper
                      const relatedTarget = e.relatedTarget as HTMLElement;
                      const isClickingInside = relatedTarget && (
                        relatedTarget.closest('.aerodrome-results') ||
                        relatedTarget.closest('.aerodrome-search-wrapper') ||
                        relatedTarget === aerodromeResultsRef.current
                      );
                      if (!isClickingInside) {
                        setTimeout(() => setShowAerodromeList(false), 200);
                      }
                    }}
                  disabled={loading}
                    className="aerodrome-search-input"
                  />
                  {aerodromeSearch && (
                    <button
                      type="button"
                      className="clear-search-btn"
                      onClick={() => {
                        setAerodromeSearch('');
                        aerodromeSearchRef.current?.focus();
                      }}
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {showAerodromeList && filteredAerodromes.length > 0 && (
                  <div className="aerodrome-results" ref={aerodromeResultsRef}>
                    <div className="aerodrome-results-header">
                      {filteredAerodromes.length} {filteredAerodromes.length === 1 ? 'result' : 'results'}
                    </div>
                    <div className="aerodrome-list">
                      {filteredAerodromes.slice(0, 10).map((aerodrome) => (
                        <button
                          key={aerodrome.name}
                          type="button"
                          className={`aerodrome-item ${selectedAerodrome.name === aerodrome.name ? 'selected' : ''}`}
                          onClick={() => {
                            handleAerodromeSelect(aerodrome);
                            // Keep focus on input for easy further searching
                            setTimeout(() => {
                              aerodromeSearchRef.current?.focus();
                              setShowAerodromeList(true);
                            }, 50);
                          }}
                          disabled={loading}
                        >
                          <div className="aerodrome-item-content">
                            <span className="aerodrome-item-name">{aerodrome.name}</span>
                            {aerodrome.icao && (
                              <span className="aerodrome-item-icao">{aerodrome.icao}</span>
                            )}
                          </div>
                          {selectedAerodrome.name === aerodrome.name && (
                            <span className="aerodrome-item-check">✓</span>
                          )}
                        </button>
                      ))}
                      {filteredAerodromes.length > 10 && (
                        <div className="aerodrome-results-footer">
                          +{filteredAerodromes.length - 10} more - refine your search
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {showAerodromeList && aerodromeSearch.trim() && filteredAerodromes.length === 0 && (
                  <div className="aerodrome-no-results">
                    No aerodromes found matching "{aerodromeSearch}"
                  </div>
                )}
                {!showAerodromeList && (
                  <button
                    type="button"
                    className="selected-aerodrome-display clickable"
                    onClick={() => {
                      setShowAerodromeList(true);
                      setTimeout(() => aerodromeSearchRef.current?.focus(), 50);
                    }}
                    disabled={loading}
                    title="Click to change aerodrome"
                  >
                    <span className="selected-aerodrome-label">Selected:</span>
                    <span className="selected-aerodrome-name">
                      {selectedAerodrome.name}
                      {selectedAerodrome.icao && (
                        <span className="selected-aerodrome-icao"> ({selectedAerodrome.icao})</span>
                      )}
                    </span>
                    <span className="selected-aerodrome-edit">✏️</span>
                  </button>
                )}
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
            
            <button 
              type="button"
              onClick={() => fetchWeather(true)} 
              disabled={loading} 
              className="refresh-btn"
            >
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
                  <div className="location-header">
                    <div className="location-icon">📍</div>
                    <div className="location-details">
                  <h3>{selectedAerodrome.name}</h3>
                  {selectedAerodrome.icao && (
                    <p className="icao-code">{selectedAerodrome.icao}</p>
                  )}
                    </div>
                  </div>
                  <div className="timestamp-card">
                    <div className="timestamp-icon">{isPlannedTime ? '📅' : '🕐'}</div>
                    <div className="timestamp-content">
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
                            <strong>Current:</strong>{' '}
                        {new Date(currentWeather.time).toLocaleString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </>
                    )}
                  </p>
                    </div>
                  </div>
                </div>

                {/* Primary Weather Metrics */}
                <div className="weather-group">
                  <h4 className="weather-group-title">
                    <span className="group-icon">🌡️</span>
                    <span className="group-text">Temperature</span>
                  </h4>
                  <div className="weather-group-cards">
                    <WeatherCard title="Temperature" value={Math.round(currentTemperature)} unit="°C" icon="🌡️" className="primary-card" />
                  <WeatherCard title="Feels Like" value={Math.round(currentApparentTemp)} unit="°C" icon="🤒" />
                  </div>
                </div>

                {/* Visibility & Conditions */}
                <div className="weather-group">
                  <h4 className="weather-group-title">
                    <span className="group-icon">👁️</span>
                    <span className="group-text">Visibility & Conditions</span>
                  </h4>
                  <div className="weather-group-cards">
                  <WeatherCard title="Visibility" value={(currentVisibility / 1000).toFixed(1)} unit="km" icon="👁️" />
                    <WeatherCard title="Rain Probability" value={Math.round(currentPrecipProb)} unit="%" icon="🌧️" />
                  </div>
                </div>

                {/* Atmospheric Conditions */}
                <div className="weather-group">
                  <h4 className="weather-group-title">
                    <span className="group-icon">💧</span>
                    <span className="group-text">Atmospheric</span>
                  </h4>
                  <div className="weather-group-cards">
                  <WeatherCard title="Humidity" value={Math.round(currentHumidity)} unit="%" icon="💧" />
                  <WeatherCard title="Dew Point" value={Math.round(currentDewpoint)} unit="°C" icon="💦" />
                  </div>
                </div>

                {/* Pressure */}
                <div className="weather-group">
                  <h4 className="weather-group-title">
                    <span className="group-icon">📊</span>
                    <span className="group-text">Pressure</span>
                  </h4>
                  <div className="weather-group-cards">
                    <WeatherCard title="QNH" value={Math.round(currentQNH)} unit="hPa" icon="⛰️" />
                  <WeatherCard title="Surface Pressure" value={Math.round(currentSurfacePressure)} unit="hPa" icon="⬇️" />
                  </div>
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
                  <AirfieldMap
                    latitude={selectedAerodrome.latitude}
                    longitude={selectedAerodrome.longitude}
                    name={selectedAerodrome.name}
                    icao={selectedAerodrome.icao}
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
    </div>
    <AddToHomeScreen />
    </>
  );
}

