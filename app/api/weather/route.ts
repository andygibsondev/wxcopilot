import { NextRequest, NextResponse } from 'next/server';
import { WeatherData } from '@/types/weather';

/**
 * Weather API Route - Fetches forecast data from Open-Meteo
 * 
 * Uses UK Met Office model (ukmo_seamless) for high-resolution UK forecasts.
 * 
 * For full API documentation, see: /docs/open-meteo-api.md
 * Official docs: https://open-meteo.com/en/docs
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  try {
    // Using UK Met Office model via Open-Meteo (high-resolution UK data)
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
    
    // If specific dates are provided, use them; otherwise get 7 days
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

    const data: WeatherData = await response.json();
    
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

