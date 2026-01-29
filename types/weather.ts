export type WeatherProvider = 'metoffice' | 'openmeteo';

export interface WeatherData {
  provider?: WeatherProvider;
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_weather: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    time: string;
  };
  hourly: {
    time: string[];
    // Ground-level temperature & humidity (2m height)
    temperature_2m: number[];
    relativehumidity_2m: number[];
    dewpoint_2m: number[];
    apparent_temperature: number[];
    // Surface wind (10m height - standard meteorological measurement)
    windspeed_10m: number[];
    winddirection_10m: number[];
    windgusts_10m: number[];
    // Pressure
    surface_pressure: number[];      // Pressure at ground level (hPa)
    pressure_msl: number[];          // QNH - Mean sea level pressure (hPa)
    // Clouds
    cloudcover: number[];
    cloudcover_low: number[];
    cloudcover_mid: number[];
    cloudcover_high: number[];
    // Visibility & precipitation
    visibility: number[];
    precipitation: number[];
    precipitation_probability: number[];
    weathercode: number[];
  };
  hourly_units: {
    temperature_2m: string;
    relativehumidity_2m: string;
    dewpoint_2m: string;
    apparent_temperature: string;
    windspeed_10m: string;
    winddirection_10m: string;
    windgusts_10m: string;
    surface_pressure: string;
    pressure_msl: string;
    cloudcover: string;
    cloudcover_low: string;
    cloudcover_mid: string;
    cloudcover_high: string;
    visibility: string;
    precipitation: string;
    precipitation_probability: string;
    weathercode: string;
  };
}

export interface Aerodrome {
  name: string;
  icao?: string;
  latitude: number;
  longitude: number;
}

