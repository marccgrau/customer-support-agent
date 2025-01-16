import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;

    if (!key || !region) {
      return NextResponse.json(
        { error: 'Azure Speech credentials not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({ token: key, region });
  } catch (error) {
    console.error('Error getting speech token:', error);
    return NextResponse.json(
      { error: 'Failed to get speech token' },
      { status: 500 }
    );
  }
}
