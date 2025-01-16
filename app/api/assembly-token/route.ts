// app/api/assembly-token/route.ts
import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

export async function GET() {
  try {
    // Check if API key exists
    const apiKey = process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      console.error('AssemblyAI API key is not configured');
      return NextResponse.json(
        { error: 'AssemblyAI API key not configured' },
        { status: 500 }
      );
    }

    // Initialize AssemblyAI client
    const client = new AssemblyAI({
      apiKey: apiKey,
    });

    // Create temporary token
    console.log('Creating temporary token...');
    const token = await client.realtime.createTemporaryToken({
      expires_in: 480, // 8 minutes
    });
    console.log('Token created successfully');

    // Return the token
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Failed to generate AssemblyAI token:', error);
    // Return error with more details
    return NextResponse.json(
      {
        error: 'Failed to generate token',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
