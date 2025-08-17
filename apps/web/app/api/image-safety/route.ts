// app/api/image-safety/route.ts - API route handler

import { NextRequest, NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Force this API route to use Node.js runtime instead of Edge Runtime
export const runtime = 'nodejs';

// Types
interface SafeSearchResult {
    adult: string;
    spoof: string;
    medical: string;
    violence: string;
    racy: string;
}

interface SafetyAnnotation {
    name: string;
    likelihood: string;
}

interface ImageSafetyResult {
    isSafe: boolean;
    likelihood: string;
    annotations: SafetyAnnotation[];
    safeSearch: SafeSearchResult;
    filename?: string;
    error?: string;
}

// Google Vision API client
let visionClient: ImageAnnotatorClient | null = null;

/**
 * Initialize Vision API client
 */
function getVisionClient(): ImageAnnotatorClient {
    if (!visionClient) {
        const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS;
        const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

        if (!credentials || !projectId) {
            throw new Error('Google Cloud credentials not configured. Please set GOOGLE_CLOUD_CREDENTIALS and GOOGLE_CLOUD_PROJECT_ID environment variables.');
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

/**
 * Determine if image is safe based on SafeSearch results
 */
function determineSafety(safeSearch: any): boolean {
    const dangerousLevels = ['LIKELY', 'VERY_LIKELY'];

    return !(
        dangerousLevels.includes(safeSearch.adult) ||
        dangerousLevels.includes(safeSearch.violence) ||
        dangerousLevels.includes(safeSearch.racy)
    );
}

/**
 * Create safety annotations from SafeSearch results
 */
function createSafetyAnnotations(safeSearch: any): SafetyAnnotation[] {
    const annotations: SafetyAnnotation[] = [];

    Object.entries(safeSearch).forEach(([key, value]) => {
        if (typeof value === 'string') {
            annotations.push({
                name: key,
                likelihood: value
            });
        }
    });

    return annotations;
}

/**
 * Get overall likelihood level from SafeSearch results
 */
function getOverallLikelihood(safeSearch: any): string {
    const levels = ['VERY_UNLIKELY', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'VERY_LIKELY'];
    const values = [safeSearch.adult, safeSearch.violence, safeSearch.racy];

    let maxLevel = 'VERY_UNLIKELY';
    for (const value of values) {
        if (levels.indexOf(value) > levels.indexOf(maxLevel)) {
            maxLevel = value;
        }
    }

    return maxLevel;
}

/**
 * Handle POST request for image safety checking
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { imageUrl, imageData, filename } = body;

        // Validate input
        if (!imageUrl && !imageData) {
            return NextResponse.json(
                { error: 'Either imageUrl or imageData is required' },
                { status: 400 }
            );
        }

        const client = getVisionClient();
        let result;

        if (imageUrl) {
            // Handle URL-based image checking
            console.log('🔍 Checking image safety for URL:', imageUrl);
            [result] = await client.safeSearchDetection(imageUrl);
        } else if (imageData) {
            // Handle buffer-based image checking
            console.log('🔍 Checking image safety for uploaded file:', filename || 'unknown');
            const buffer = Buffer.from(imageData);
            [result] = await client.safeSearchDetection({
                image: { content: buffer.toString('base64') }
            });
        }

        const safeSearch = result?.safeSearchAnnotation;

        if (!safeSearch) {
            return NextResponse.json(
                { error: 'Failed to analyze image safety - no SafeSearch results returned' },
                { status: 500 }
            );
        }

        // Process results
        const safeSearchResult: SafeSearchResult = {
            adult: safeSearch.adult || 'UNKNOWN',
            spoof: safeSearch.spoof || 'UNKNOWN',
            medical: safeSearch.medical || 'UNKNOWN',
            violence: safeSearch.violence || 'UNKNOWN',
            racy: safeSearch.racy || 'UNKNOWN',
        };

        const isSafe = determineSafety(safeSearch);
        const annotations = createSafetyAnnotations(safeSearch);
        const likelihood = getOverallLikelihood(safeSearch);

        const response: ImageSafetyResult = {
            isSafe,
            likelihood,
            annotations,
            safeSearch: safeSearchResult,
            filename,
        };

        console.log('✅ Image safety check completed:', {
            filename: filename || 'URL',
            isSafe,
            likelihood,
            adult: safeSearchResult.adult,
            violence: safeSearchResult.violence,
            racy: safeSearchResult.racy
        });

        return NextResponse.json(response);

    } catch (error) {
        console.error('❌ Image safety check error:', error);

        // Return structured error response
        return NextResponse.json(
            {
                error: 'Failed to check image safety',
                details: error instanceof Error ? error.message : 'Unknown error',
                isSafe: false,
                likelihood: 'UNKNOWN',
                annotations: [],
                safeSearch: {
                    adult: 'UNKNOWN',
                    spoof: 'UNKNOWN',
                    medical: 'UNKNOWN',
                    violence: 'UNKNOWN',
                    racy: 'UNKNOWN',
                }
            },
            { status: 500 }
        );
    }
}

// Optional: Handle GET request for health check
export async function GET() {
    try {
        // Simple health check
        const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS;
        const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

        if (!credentials || !projectId) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Google Cloud credentials not configured'
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            status: 'ok',
            message: 'Image safety API is ready',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                message: 'Service unavailable',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}