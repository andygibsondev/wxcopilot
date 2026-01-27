import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { valid: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    const appPassword = process.env.APP_PASSWORD || 'kernan';

    if (password === appPassword) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json(
        { valid: false, error: 'Incorrect password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Password validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}
