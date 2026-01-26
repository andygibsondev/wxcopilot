# Met Office DataHub API Setup Guide

This guide explains how to configure the app to use the Met Office DataHub API.

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Weather API Configuration
# Set to 'metoffice' to use Met Office DataHub, or 'openmeteo' for Open-Meteo (default)
WEATHER_API_PROVIDER=metoffice

# Met Office DataHub API Key
# Get your API key from: https://www.metoffice.gov.uk/services/data/datapoint
# Format depends on your API key type:
# - For IBM API Connect: "client-id:client-secret"
# - For Bearer token: "your-bearer-token"
# - For API key: "your-api-key"
MET_OFFICE_API_KEY=your_api_key_here

# Optional: Override the default Met Office DataHub API endpoint
# MET_OFFICE_API_URL=https://api-metoffice.apiconnect.ibmcloud.com/metoffice/production/v0/forecasts/point/hourly
```

## Getting Your API Key

1. Visit the [Met Office DataHub](https://www.metoffice.gov.uk/services/data/datapoint)
2. Register for an account
3. Create an API key
4. Copy the key to your `.env.local` file

## Testing Both APIs

You can test both APIs by using the `provider` query parameter:

- **Open-Meteo**: `/api/weather?latitude=51.5&longitude=-0.1&provider=openmeteo`
- **Met Office DataHub**: `/api/weather?latitude=51.5&longitude=-0.1&provider=metoffice`

## API Response Mapping

The Met Office DataHub API response structure may vary. The transformation function in `app/api/weather/route.ts` attempts to map common field names, but you may need to adjust the `transformMetOfficeResponse` function based on your actual API response.

Common field mappings:
- `screenTemperature` → `temperature_2m`
- `windSpeed10m` → `windspeed_10m`
- `windDirectionFrom10m` → `winddirection_10m`
- `totalCloudCover` → `cloudcover`
- `significantWeatherCode` → `weathercode`

## Troubleshooting

### Authentication Errors
- Verify your API key is correct
- Check if your API key format matches the expected format (see environment variables above)
- Ensure the API key has the necessary permissions

### Endpoint Errors
- Verify the API endpoint URL is correct
- Check the Met Office DataHub API documentation for the latest endpoint structure
- Update `MET_OFFICE_API_URL` in `.env.local` if needed

### Data Mapping Errors
- Check the actual API response structure using browser dev tools or Postman
- Update the `transformMetOfficeResponse` function to match your API's response format
- Check console logs for detailed error messages

