import { NextRequest, NextResponse } from 'next/server';
import { checkUsage, incrementUsage, rateLimitHeaders } from '@/lib/usage';

const CACHE_SECONDS = 300; // 5 minutes

export async function GET(request: NextRequest) {
  const check = await checkUsage(request);
  if (!check.allowed) {
    return NextResponse.json(
      { error: check.message },
      { status: 429, headers: rateLimitHeaders(check.context) }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const icao = searchParams.get('icao');

  if (!icao) {
    return NextResponse.json(
      { error: 'ICAO code is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch METAR and TAF from Aviation Weather Center (free, no API key required)
    const [metarResponse, tafResponse] = await Promise.all([
      fetch(
        `https://aviationweather.gov/api/data/metar?ids=${icao}&format=json&taf=false&hours=1`,
        { next: { revalidate: CACHE_SECONDS } }
      ),
      fetch(
        `https://aviationweather.gov/api/data/taf?ids=${icao}&format=json&hours=24`,
        { next: { revalidate: CACHE_SECONDS } }
      ),
    ]);

    let metarData = null;
    let tafData = null;

    if (metarResponse.ok) {
      const metarJson = await metarResponse.json();
      // API returns array, get first result
      if (Array.isArray(metarJson) && metarJson.length > 0) {
        metarData = metarJson[0];
      }
    }

    if (tafResponse.ok) {
      const tafJson = await tafResponse.json();
      // API returns array, get first result
      if (Array.isArray(tafJson) && tafJson.length > 0) {
        tafData = tafJson[0];
      }
    }

    await incrementUsage(request);
    return NextResponse.json(
      { metar: metarData, taf: tafData },
      { headers: rateLimitHeaders(check.context, { consumed: 1 }) }
    );
  } catch (error) {
    console.error('Error fetching METAR/TAF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch METAR/TAF data';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}


