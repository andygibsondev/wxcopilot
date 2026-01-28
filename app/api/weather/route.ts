import { NextRequest, NextResponse } from 'next/server';
import { WeatherData } from '@/types/weather';

/**
 * Weather API Route - Supports both Met Office DataHub and Open-Meteo
 * 
 * Set WEATHER_API_PROVIDER environment variable to switch providers:
 * - 'metoffice' for Met Office DataHub API (requires MET_OFFICE_API_KEY)
 * - 'openmeteo' for Open-Meteo (fallback, no API key required)
 * 
 * For testing, you can also use ?provider=metoffice or ?provider=openmeteo query parameter
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  
  // Allow override via query parameter for testing, otherwise use env var
  const providerParam = searchParams.get('provider');
  const provider = providerParam || process.env.WEATHER_API_PROVIDER || 'openmeteo';

  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  try {
    let data: WeatherData;

    if (provider === 'metoffice') {
      data = await fetchMetOfficeData(latitude, longitude, startDate, endDate);
    } else {
      data = await fetchOpenMeteoData(latitude, longitude, startDate, endDate);
    }

    // Validate that we have the required data
    if (!data.current_weather || !data.hourly) {
      throw new Error('Invalid weather data structure received');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching weather:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch weather data';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Fetch weather data from Met Office Weather DataHub Site Specific API
 *
 * Uses GET /point/hourly per:
 * - https://datahub.metoffice.gov.uk/docs/.../api-documentation#get-/point/hourly
 * - https://github.com/MetOffice/weather_datahub_utilities (site_specific_download)
 */
async function fetchMetOfficeData(
  latitude: string,
  longitude: string,
  _startDate: string | null,
  _endDate: string | null
): Promise<WeatherData> {
  const apiKey = process.env.MET_OFFICE_API_KEY;

  if (!apiKey) {
    throw new Error('MET_OFFICE_API_KEY environment variable is not set. Please add it to your .env.local file.');
  }

  const baseUrl =
    process.env.MET_OFFICE_API_URL ||
    'https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/hourly';

  const url = new URL(baseUrl);
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set('excludeParameterMetadata', 'FALSE');
  url.searchParams.set('includeLocationName', 'TRUE');

  const headers: HeadersInit = {
    Accept: 'application/json',
    apikey: apiKey,
  };

  const response = await fetch(url.toString(), {
    headers,
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Met Office API error:', response.status, errorText);
    
    // Provide helpful error messages
    if (response.status === 401 || response.status === 403) {
      throw new Error('Met Office API authentication failed. Please check your API key.');
    }
    if (response.status === 404) {
      throw new Error('Met Office API endpoint not found. Please check the API URL configuration.');
    }
    
    throw new Error(`Met Office API error: ${response.status} - ${errorText}`);
  }

  const metOfficeData = await response.json();
  
  // Transform Met Office DataHub response to match our WeatherData interface
  return transformMetOfficeResponse(metOfficeData, latitude, longitude);
}

/**
 * Transform Met Office Site Specific API response to our WeatherData format.
 *
 * Handles both GeoJSON-style (features[].properties.timeSeries) and flat
 * (properties.timeSeries / timeSeries) shapes. Field names follow Met Office
 * conventions; adjust if the real response differs.
 */
function transformMetOfficeResponse(
  metOfficeData: any,
  latitude: string,
  longitude: string
): WeatherData {
  const timeSeries =
    metOfficeData.features?.[0]?.properties?.timeSeries ??
    metOfficeData.properties?.timeSeries ??
    metOfficeData.timeSeries ??
    [];

  if (!timeSeries || timeSeries.length === 0) {
    throw new Error('No time series data found in Met Office API response');
  }

  // Get current weather (first time step or most recent)
  const current = timeSeries[0] || {};
  const now = new Date();

  // Helper function to safely extract values from time series
  const extractValues = (field: string, defaultValue: number = 0): number[] => {
    return timeSeries.map((ts: any) => {
      // Try multiple possible field names
      return ts[field] || 
             ts[field.toLowerCase()] || 
             ts[field.replace(/([A-Z])/g, '_$1').toLowerCase()] ||
             defaultValue;
    });
  };

  // Map Met Office fields to our format
  // Adjust field names based on actual DataHub API response
  const hourly = {
    time: timeSeries.map((ts: any) => ts.time || ts.validTime || ts.forecastTime || now.toISOString()),
    temperature_2m: extractValues('screenTemperature', 0),
    relativehumidity_2m: extractValues('screenRelativeHumidity', 0),
    dewpoint_2m: extractValues('dewPointTemperature', 0),
    apparent_temperature: extractValues('feelsLikeTemperature', 0),
    windspeed_10m: extractValues('windSpeed10m', 0),
    winddirection_10m: extractValues('windDirectionFrom10m', 0),
    windgusts_10m: extractValues('windGustSpeed10m', 0),
    surface_pressure: extractValues('surfacePressure', 1013.25),
    pressure_msl: extractValues('meanSeaLevelPressure', 1013.25),
    cloudcover: extractValues('totalCloudCover', 0),
    cloudcover_low: extractValues('lowCloudCover', 0),
    cloudcover_mid: extractValues('mediumCloudCover', 0),
    cloudcover_high: extractValues('highCloudCover', 0),
    visibility: extractValues('visibility', 10000),
    precipitation: extractValues('totalPrecipitationAmount', 0),
    precipitation_probability: extractValues('probabilityOfPrecipitation', 0),
    weathercode: extractValues('significantWeatherCode', 0),
  };

  return {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    generationtime_ms: 0,
    utc_offset_seconds: 0,
    timezone: 'Europe/London',
    timezone_abbreviation: 'GMT',
    elevation: metOfficeData.elevation || 0,
    current_weather: {
      temperature: current.screenTemperature || current.temperature || 0,
      windspeed: current.windSpeed10m || current.windSpeed || 0,
      winddirection: current.windDirectionFrom10m || current.windDirection || 0,
      weathercode: current.significantWeatherCode || current.weatherCode || 0,
      time: current.time || current.validTime || now.toISOString(),
    },
    hourly,
    hourly_units: {
      temperature_2m: '°C',
      relativehumidity_2m: '%',
      dewpoint_2m: '°C',
      apparent_temperature: '°C',
      windspeed_10m: 'km/h',
      winddirection_10m: '°',
      windgusts_10m: 'km/h',
      surface_pressure: 'hPa',
      pressure_msl: 'hPa',
      cloudcover: '%',
      cloudcover_low: '%',
      cloudcover_mid: '%',
      cloudcover_high: '%',
      visibility: 'm',
      precipitation: 'mm',
      precipitation_probability: '%',
      weathercode: 'wmo code',
    },
  };
}

/**
 * Original Open-Meteo fetch function (kept as fallback)
 */
async function fetchOpenMeteoData(
  latitude: string,
  longitude: string,
  startDate: string | null,
  endDate: string | null
): Promise<WeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set('models', 'ukmo_seamless'); // Use UK Met Office model
  url.searchParams.set('current_weather', 'true');
  url.searchParams.set('hourly', [
    // Ground-level temperature & humidity (2m = standard surface measurement)
    'temperature_2m',
    'relativehumidity_2m',
    'dewpoint_2m',
    'apparent_temperature',
    // Surface wind (10m = standard meteorological height, closest to ground)
    'windspeed_10m',
    'winddirection_10m',
    'windgusts_10m',
    // Pressure (surface and QNH for aviation)
    'surface_pressure',
    'pressure_msl',
    // Cloud and visibility
    'cloudcover',
    'cloudcover_low',
    'cloudcover_mid',
    'cloudcover_high',
    'visibility',
    // Precipitation
    'precipitation',
    'precipitation_probability',
    // Weather code
    'weathercode',
  ].join(','));
  url.searchParams.set('timezone', 'Europe/London');

  if (startDate && endDate) {
    url.searchParams.set('start_date', startDate);
    url.searchParams.set('end_date', endDate);
  } else {
    // Default: get 7 days of forecast
    url.searchParams.set('forecast_days', '7');
  }

  const response = await fetch(url.toString(), {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Weather API error:', response.status, errorText);
    throw new Error(`Weather API error: ${response.status}`);
  }

  return await response.json();
}
