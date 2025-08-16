
import { NextRequest, NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Force this API route to use Node.js runtime instead of Edge Runtime
export const runtime = 'nodejs';

// Google Vision API client
let visionClient: ImageAnnotatorClient | null = null;

// Initialize Vision API client
function getVisionClient(): ImageAnnotatorClient {
  if (!visionClient) {
    const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

    if (!credentials || !projectId) {
      throw new Error('Google Cloud credentials not configured');
    }

    try {
      const credentialsObj = JSON.parse(
        Buffer.from(credentials, 'base64').toString('utf8')
      );

      visionClient = new ImageAnnotatorClient({
        projectId: projectId,
        credentials: credentialsObj,
      });

      console.log('✅ Google Vision API client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google Vision API client:', error);
      throw new Error(`Failed to initialize Google Vision API client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return visionClient;
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const client = getVisionClient();

    // Perform safe search detection
    const [result] = await client.safeSearchDetection(imageUrl);
    const safeSearch = result.safeSearchAnnotation;

    if (!safeSearch) {
      return NextResponse.json(
        { error: 'Failed to analyze image safety' },
        { status: 500 }
      );
    }

    // Define safety levels (VERY_UNLIKELY, UNLIKELY, POSSIBLE, LIKELY, VERY_LIKELY)
    const isSafe = 
      safeSearch.adult !== 'LIKELY' && 
      safeSearch.adult !== 'VERY_LIKELY' &&
      safeSearch.violence !== 'LIKELY' && 
      safeSearch.violence !== 'VERY_LIKELY' &&
      safeSearch.racy !== 'LIKELY' && 
      safeSearch.racy !== 'VERY_LIKELY';

    return NextResponse.json({
      isSafe,
      safeSearch: {
        adult: safeSearch.adult || 'UNKNOWN',
        spoof: safeSearch.spoof || 'UNKNOWN',
        medical: safeSearch.medical || 'UNKNOWN',
        violence: safeSearch.violence || 'UNKNOWN',
        racy: safeSearch.racy || 'UNKNOWN',
      }
    });

  } catch (error) {
    console.error('Image safety check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check image safety',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
