# WxCopilot

Your aviation weather copilot — a Next.js application that provides aviation weather information for UK aerodromes, helping pilots make informed flight decisions.

## Features

- **Real-time Weather Data**: Fetches current weather from UK Met Office via Open-Meteo API
- **Aerodrome Selection**: Choose from 25+ UK aerodromes
- **Aviation-Focused Display**:
  - Wind speed and direction (in knots)
  - Wind gusts
  - Cloud base estimation
  - Cloud cover (low, mid, high)
  - Visibility
  - Temperature and humidity
  - Precipitation
- **Flight Decision Aid**: Automated assessment of weather conditions for VFR flight
- **Responsive Design**: Works on both mobile and desktop devices

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Data Source

This application uses the [Open-Meteo UK Met Office API](https://open-meteo.com/en/docs/ukmo-api), which provides free access to UK Met Office weather data without requiring API key registration.

## Flight Decision Criteria

The flight decision component evaluates weather conditions based on:

- **Wind Speed**: < 20 kts (good), 20-30 kts (marginal), > 30 kts (poor)
- **Visibility**: > 5 km (good), 3-5 km (marginal), < 3 km (poor)
- **Cloud Base**: > 1000 ft (good), 500-1000 ft (marginal), < 500 ft (poor)
- **Cloud Cover**: < 50% (good), 50-75% (marginal), > 75% (poor)
- **Precipitation**: None (good), Light (marginal), Heavy (poor)

## Project Structure

```
wxcopilot/
├── app/
│   ├── api/
│   │   └── weather/
│   │       └── route.ts      # API route for fetching weather
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Main page
│   └── globals.css            # Global styles
├── components/
│   ├── WeatherCard.tsx        # Reusable weather card component
│   ├── WindDisplay.tsx        # Wind information display
│   ├── CloudBaseDisplay.tsx   # Cloud conditions display
│   └── FlightDecision.tsx     # Flight decision assessment
├── data/
│   └── aerodromes.ts          # UK aerodrome data
└── types/
    └── weather.ts             # TypeScript type definitions
```

## Technologies

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Open-Meteo API**: Weather data source

## License

MIT

