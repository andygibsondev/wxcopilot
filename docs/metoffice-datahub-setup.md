# Met Office DataHub API Setup Guide

This guide explains how to configure the app to use the Met Office **Weather DataHub Site Specific** API (GET /point/hourly).

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Weather API Configuration
# Set to 'metoffice' to use Met Office DataHub, or 'openmeteo' for Open-Meteo
WEATHER_API_PROVIDER=metoffice

# Met Office DataHub API Key (Site Specific subscription)
# Get your API key from: https://datahub.metoffice.gov.uk (Weather DataHub → Site Specific)
# Passed as the 'apikey' header per Met Office utilities.
MET_OFFICE_API_KEY=your_api_key_here

# Optional: Override the default Met Office Site Specific API endpoint (GET /point/hourly)
# MET_OFFICE_API_URL=https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/hourly
```

## Getting Your API Key

1. Visit [Met Office Weather DataHub](https://datahub.metoffice.gov.uk)
2. Register or sign in, subscribe to **Site Specific** forecast
3. Create an application and copy the API key (JWT)
4. Set `MET_OFFICE_API_KEY` in your `.env.local` file

## Testing Both APIs

You can test both APIs by using the `provider` query parameter:

- **Open-Meteo**: `/api/weather?latitude=51.5&longitude=-0.1&provider=openmeteo`
- **Met Office DataHub**: `/api/weather?latitude=51.5&longitude=-0.1&provider=metoffice`

## API Response Mapping

The Site Specific API returns a structure with a time series (e.g. `features[].properties.timeSeries` or `properties.timeSeries`). The `transformMetOfficeResponse` function in `app/api/weather/route.ts` maps Met Office fields to our `WeatherData` format. If the real response shape differs, adjust that function.

Common field mappings:
- `screenTemperature` → `temperature_2m`
- `windSpeed10m` → `windspeed_10m`
- `windDirectionFrom10m` → `winddirection_10m`
- `totalCloudCover` → `cloudcover`
- `significantWeatherCode` → `weathercode`

## Troubleshooting

### Authentication Errors
- Verify your API key is correct and not expired (JWTs have a limited lifetime)
- Ensure the key is for **Site Specific** / `sitespecific/v0`
- The app sends the key in the `apikey` header; see [weather_datahub_utilities](https://github.com/MetOffice/weather_datahub_utilities) `site_specific_download`.

### Endpoint Errors
- Default endpoint: `https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/hourly`
- See [DataHub API documentation](https://datahub.metoffice.gov.uk/docs/f/category/site-specific/type/site-specific/api-documentation#get-/point/hourly)
- Override with `MET_OFFICE_API_URL` in `.env.local` if needed

### Data Mapping Errors
- Check the actual API response structure using browser dev tools or Postman
- Update the `transformMetOfficeResponse` function to match your API's response format
- Check console logs for detailed error messages

