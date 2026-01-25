# Open-Meteo Forecast API Documentation

Base URL: `https://api.open-meteo.com/v1/forecast`

This is a free, open-source weather API that requires no API key.

- **Official Documentation**: https://open-meteo.com/en/docs
- **UK Met Office API**: https://open-meteo.com/en/docs/ukmo-api

---

## Required Parameters

| Parameter   | Description                                      | Example          |
|-------------|--------------------------------------------------|------------------|
| `latitude`  | Latitude in decimal degrees                      | `51.5074`        |
| `longitude` | Longitude in decimal degrees                     | `-0.1278`        |

---

## Weather Models

Use the `models` parameter to select a specific weather model.

| Model                            | Description                                    | Resolution | Coverage |
|----------------------------------|------------------------------------------------|------------|----------|
| `ukmo_seamless`                  | UK Met Office seamless (recommended for UK)    | 2km/10km   | UK/Global|
| `ukmo_uk_deterministic_2km`      | UK Met Office high resolution                  | 2km        | UK only  |
| `ukmo_global_deterministic_10km` | UK Met Office global                           | 10km       | Global   |
| `best_match`                     | Auto-select best model for location            | Varies     | Global   |
| `ecmwf_ifs04`                    | ECMWF IFS model                                | 0.4°       | Global   |
| `gfs_seamless`                   | NOAA GFS model                                 | 0.25°      | Global   |

**Example**: `&models=ukmo_seamless`

---

## Time Range Parameters

| Parameter       | Description                          | Default | Range     |
|-----------------|--------------------------------------|---------|-----------|
| `forecast_days` | Number of forecast days              | 7       | 1-16      |
| `past_days`     | Include N past days                  | 0       | 0-92      |
| `start_date`    | Start date for forecast (YYYY-MM-DD)| -       | -         |
| `end_date`      | End date for forecast (YYYY-MM-DD)  | -       | -         |

**Example**: `&forecast_days=3` or `&start_date=2026-01-25&end_date=2026-01-26`

---

## Timezone

| Parameter  | Description                              | Example           |
|------------|------------------------------------------|-------------------|
| `timezone` | Convert times to specified timezone      | `Europe/London`   |

Options:
- `Europe/London` - UK timezone
- `auto` - Auto-detect from coordinates
- `UTC` - Use UTC (default)

---

## Current Weather

| Parameter         | Description                    | Values       |
|-------------------|--------------------------------|--------------|
| `current_weather` | Include current weather snapshot | `true/false` |

Returns:
- `temperature` - Current temperature
- `windspeed` - Current wind speed
- `winddirection` - Current wind direction
- `weathercode` - Current WMO weather code
- `time` - Observation time

---

## Hourly Variables

Use `hourly=` parameter with comma-separated values.

### Temperature & Humidity

| Variable               | Description                  | Unit    |
|------------------------|------------------------------|---------|
| `temperature_2m`       | Temperature at 2m height     | °C      |
| `relativehumidity_2m`  | Relative humidity at 2m      | %       |
| `dewpoint_2m`          | Dew point at 2m              | °C      |
| `apparent_temperature` | Feels like temperature       | °C      |

### Wind

| Variable            | Description                    | Unit   |
|---------------------|--------------------------------|--------|
| `windspeed_10m`     | Wind speed at 10m              | km/h   |
| `winddirection_10m` | Wind direction at 10m          | °      |
| `windgusts_10m`     | Wind gusts at 10m              | km/h   |
| `windspeed_80m`     | Wind speed at 80m              | km/h   |
| `windspeed_120m`    | Wind speed at 120m             | km/h   |
| `windspeed_180m`    | Wind speed at 180m             | km/h   |

> **Note**: Wind direction is in degrees where 0° = North, 90° = East, 180° = South, 270° = West

### Precipitation

| Variable                      | Description                      | Unit |
|-------------------------------|----------------------------------|------|
| `precipitation`               | Total precipitation              | mm   |
| `precipitation_probability`   | Probability of precipitation     | %    |
| `rain`                        | Rain only                        | mm   |
| `showers`                     | Shower precipitation             | mm   |
| `snowfall`                    | Snowfall                         | cm   |

### Clouds & Visibility

| Variable         | Description                    | Unit   |
|------------------|--------------------------------|--------|
| `cloudcover`     | Total cloud cover              | %      |
| `cloudcover_low` | Low clouds (below 3km)         | %      |
| `cloudcover_mid` | Mid clouds (3-8km)             | %      |
| `cloudcover_high`| High clouds (above 8km)        | %      |
| `visibility`     | Visibility                     | meters |

### Pressure & Miscellaneous

| Variable          | Description                              | Unit   |
|-------------------|------------------------------------------|--------|
| `surface_pressure`| Surface pressure                         | hPa    |
| `pressure_msl`    | Mean sea level pressure                  | hPa    |
| `weathercode`     | WMO weather interpretation code          | -      |
| `is_day`          | 1 if day, 0 if night                     | -      |
| `uv_index`        | UV index                                 | 0-11+  |
| `cape`            | Convective available potential energy    | J/kg   |

---

## Daily Variables

Use `daily=` parameter with comma-separated values.

| Variable                        | Description                  | Unit   |
|---------------------------------|------------------------------|--------|
| `temperature_2m_max`            | Daily max temperature        | °C     |
| `temperature_2m_min`            | Daily min temperature        | °C     |
| `precipitation_sum`             | Total daily precipitation    | mm     |
| `precipitation_hours`           | Hours with precipitation     | hours  |
| `precipitation_probability_max` | Max daily precip probability | %      |
| `windspeed_10m_max`             | Max wind speed               | km/h   |
| `windgusts_10m_max`             | Max wind gusts               | km/h   |
| `sunrise`                       | Sunrise time                 | ISO8601|
| `sunset`                        | Sunset time                  | ISO8601|
| `uv_index_max`                  | Max UV index                 | 0-11+  |

---

## Unit Options

| Parameter            | Options                      | Default |
|----------------------|------------------------------|---------|
| `temperature_unit`   | `celsius`, `fahrenheit`      | celsius |
| `windspeed_unit`     | `kmh`, `ms`, `mph`, `kn`     | kmh     |
| `precipitation_unit` | `mm`, `inch`                 | mm      |

**Example**: `&windspeed_unit=kn` for knots

---

## WMO Weather Codes

| Code     | Description                          |
|----------|--------------------------------------|
| 0        | Clear sky                            |
| 1        | Mainly clear                         |
| 2        | Partly cloudy                        |
| 3        | Overcast                             |
| 45       | Fog                                  |
| 48       | Depositing rime fog                  |
| 51       | Drizzle: Light                       |
| 53       | Drizzle: Moderate                    |
| 55       | Drizzle: Dense                       |
| 56       | Freezing drizzle: Light              |
| 57       | Freezing drizzle: Dense              |
| 61       | Rain: Slight                         |
| 63       | Rain: Moderate                       |
| 65       | Rain: Heavy                          |
| 66       | Freezing rain: Light                 |
| 67       | Freezing rain: Heavy                 |
| 71       | Snowfall: Slight                     |
| 73       | Snowfall: Moderate                   |
| 75       | Snowfall: Heavy                      |
| 77       | Snow grains                          |
| 80       | Rain showers: Slight                 |
| 81       | Rain showers: Moderate               |
| 82       | Rain showers: Violent                |
| 85       | Snow showers: Slight                 |
| 86       | Snow showers: Heavy                  |
| 95       | Thunderstorm: Slight or moderate     |
| 96       | Thunderstorm with slight hail        |
| 99       | Thunderstorm with heavy hail         |

---

## Example API Requests

### Basic Forecast for London

```
https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&hourly=temperature_2m
```

### UK Met Office Model with Aviation Data

```
https://api.open-meteo.com/v1/forecast
  ?latitude=51.5074
  &longitude=-0.1278
  &models=ukmo_seamless
  &current_weather=true
  &hourly=temperature_2m,windspeed_10m,winddirection_10m,windgusts_10m,visibility,cloudcover,cloudcover_low,cloudcover_mid,cloudcover_high,precipitation,weathercode
  &timezone=Europe/London
  &forecast_days=7
```

### Specific Date Range

```
https://api.open-meteo.com/v1/forecast
  ?latitude=51.5074
  &longitude=-0.1278
  &start_date=2026-01-25
  &end_date=2026-01-26
  &hourly=temperature_2m,windspeed_10m
```

### Wind Speed in Knots

```
https://api.open-meteo.com/v1/forecast
  ?latitude=51.5074
  &longitude=-0.1278
  &hourly=windspeed_10m,windgusts_10m
  &windspeed_unit=kn
```

### Full Daily Summary

```
https://api.open-meteo.com/v1/forecast
  ?latitude=51.5074
  &longitude=-0.1278
  &daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,sunrise,sunset
  &timezone=Europe/London
```

---

## Response Format

The API returns JSON with the following structure:

```json
{
  "latitude": 51.5,
  "longitude": -0.125,
  "generationtime_ms": 0.5,
  "utc_offset_seconds": 0,
  "timezone": "Europe/London",
  "timezone_abbreviation": "GMT",
  "elevation": 25.0,
  "current_weather": {
    "time": "2026-01-24T12:00",
    "temperature": 8.5,
    "windspeed": 15.2,
    "winddirection": 220,
    "weathercode": 3
  },
  "hourly_units": {
    "time": "iso8601",
    "temperature_2m": "°C",
    "windspeed_10m": "km/h"
  },
  "hourly": {
    "time": ["2026-01-24T00:00", "2026-01-24T01:00", ...],
    "temperature_2m": [5.2, 4.8, ...],
    "windspeed_10m": [12.5, 14.2, ...]
  }
}
```

---

## Rate Limits & Usage

- **No API key required**
- **Free tier**: 10,000 requests/day
- **Commercial use**: See https://open-meteo.com/en/pricing
- **Caching**: Recommended to cache responses for 5-15 minutes

---

## Unit Conversions Reference

### Wind Speed

| From   | To Knots | To mph   | To m/s   |
|--------|----------|----------|----------|
| km/h   | × 0.5400 | × 0.6214 | × 0.2778 |
| knots  | -        | × 1.1508 | × 0.5144 |
| mph    | × 0.8689 | -        | × 0.4470 |
| m/s    | × 1.9438 | × 2.2369 | -        |

### Visibility

| From    | To feet      | To miles     |
|---------|--------------|--------------|
| meters  | × 3.2808     | × 0.000621   |

### Temperature

- **Celsius to Fahrenheit**: (°C × 9/5) + 32
- **Fahrenheit to Celsius**: (°F - 32) × 5/9


