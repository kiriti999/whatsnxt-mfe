
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Google Vision API client
let visionClient: ImageAnnotatorClient | null = null;

// Initialize Vision API client
function getVisionClient(): ImageAnnotatorClient {
  if (!visionClient) {
    // Check if credentials are available
    const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

    if (!credentials || !projectId) {
      throw new Error('Google Cloud credentials not configured. Please set GOOGLE_CLOUD_CREDENTIALS and GOOGLE_CLOUD_PROJECT_ID environment variables.');
    }

    try {
      // Parse credentials from environment variable
      const credentialsObj = JSON.parse(
        Buffer.from(process.env.GOOGLE_CLOUD_CREDENTIALS!, 'base64').toString('utf8')
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

// Safe Search detection levels
export interface SafeSearchResult {
  adult: 'UNKNOWN' | 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY';
  spoof: 'UNKNOWN' | 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY';
  medical: 'UNKNOWN' | 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY';
  violence: 'UNKNOWN' | 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY';
  racy: 'UNKNOWN' | 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY';
}

export interface ImageSafetyResult {
  safe: boolean;
  safeSearch: SafeSearchResult;
  blockedReasons: string[];
  confidence: 'low' | 'medium' | 'high';
}

// Configure safety thresholds
const SAFETY_THRESHOLDS = {
  adult: ['POSSIBLE', 'LIKELY', 'VERY_LIKELY'], // More strict for adult content
  spoof: ['VERY_LIKELY'], // Only block very likely spoofs
  medical: ['VERY_LIKELY'], // Only block very likely medical content
  violence: ['POSSIBLE', 'LIKELY', 'VERY_LIKELY'], // More strict for violence
  racy: ['POSSIBLE', 'LIKELY', 'VERY_LIKELY'], // More strict for racy content
};

/**
 * Scan image for inappropriate content using Google Safe Search API
 */
export async function scanImageSafety(imageBuffer: Buffer): Promise<ImageSafetyResult> {
  try {
    console.log('🔍 GOOGLE VISION API: Starting mandatory safety scan...');
    console.log('📊 Image buffer size:', imageBuffer.length, 'bytes');

    // Check if Google Cloud is configured
    if (!process.env.GOOGLE_CLOUD_CREDENTIALS || !process.env.GOOGLE_CLOUD_PROJECT_ID) {
      console.error('❌ CRITICAL: Google Cloud Vision API not configured - BLOCKING upload');
      console.error('❌ Missing GOOGLE_CLOUD_CREDENTIALS or GOOGLE_CLOUD_PROJECT_ID');
      throw new Error('Image safety scanning is not configured. Upload blocked for security.');
    }

    console.log('✅ GOOGLE VISION API: Credentials found, proceeding with safety scan...');
    const client = getVisionClient();

    // Perform safe search detection
    console.log('🔍 GOOGLE VISION API: Calling safe search detection...');
    const [result] = await client.safeSearchDetection({
      image: {
        content: imageBuffer.toString('base64'),
      },
    });

    console.log('📡 GOOGLE VISION API: Response received, analyzing results...');
    const safeSearchAnnotation = result.safeSearchAnnotation;

    if (!safeSearchAnnotation) {
      console.error('❌ GOOGLE VISION API: No safe search annotation returned');
      throw new Error('Google Vision API did not return safety results. Upload blocked.');
    }

    const safeSearch: SafeSearchResult = {
      adult: (safeSearchAnnotation.adult?.toString() || 'UNKNOWN') as SafeSearchResult['adult'],
      spoof: (safeSearchAnnotation.spoof?.toString() || 'UNKNOWN') as SafeSearchResult['spoof'],
      medical: (safeSearchAnnotation.medical?.toString() || 'UNKNOWN') as SafeSearchResult['medical'],
      violence: (safeSearchAnnotation.violence?.toString() || 'UNKNOWN') as SafeSearchResult['violence'],
      racy: (safeSearchAnnotation.racy?.toString() || 'UNKNOWN') as SafeSearchResult['racy'],
    };

    console.log('📊 GOOGLE VISION API: Detailed safety results:', safeSearch);

    // Check against thresholds
    const blockedReasons: string[] = [];
    let safe = true;

    // Check each category against thresholds
    Object.entries(SAFETY_THRESHOLDS).forEach(([category, thresholds]) => {
      const level = safeSearch[category as keyof SafeSearchResult];
      console.log(`🔍 SAFETY CHECK: ${category}: ${level} vs thresholds:`, thresholds);
      if (thresholds.includes(level)) {
        safe = false;
        blockedReasons.push(`${category}: ${level}`);
      }
    });

    // Determine confidence level
    let confidence: 'low' | 'medium' | 'high' = 'low';
    const highConfidenceResults = Object.values(safeSearch).filter(level =>
      ['LIKELY', 'VERY_LIKELY'].includes(level)
    );

    if (highConfidenceResults.length >= 2) {
      confidence = 'high';
    } else if (highConfidenceResults.length === 1) {
      confidence = 'medium';
    }

    const resultSummary = {
      safe,
      safeSearch,
      blockedReasons,
      confidence
    };

    if (!safe) {
      console.error('❌ GOOGLE VISION API: Image FAILED safety check:', {
        blockedReasons,
        confidence,
        safeSearch
      });
    } else {
      console.log('✅ GOOGLE VISION API: Image PASSED safety check');
    }

    return resultSummary;

  } catch (error) {
    console.error('❌ GOOGLE VISION API: CRITICAL safety scan error:', error);

    // SECURITY: In case of API errors, we BLOCK the upload for safety
    console.error('🚫 GOOGLE VISION API: BLOCKING upload due to safety scan failure');

    // Throw error to block upload when safety scan fails
    throw new Error(`Safety scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate image file before processing
 */
export function validateImageForSafety(file: File): void {
  // Check file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Check file size (max 20MB for Google Vision API)
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    throw new Error('Image too large for safety scanning (max 20MB)');
  }

  // Check for supported formats
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
  if (!supportedTypes.includes(file.type)) {
    throw new Error('Unsupported image format for safety scanning');
  }
}

/**
 * Get human-readable safety summary
 */
export function getSafetySummary(result: ImageSafetyResult): string {
  if (result.safe) {
    return 'Image passed all safety checks';
  }

  const reasons = result.blockedReasons.join(', ');
  return `Image blocked due to: ${reasons}`;
}

/**
 * Check if manual review is recommended
 */
export function requiresManualReview(result: ImageSafetyResult): boolean {
  // Recommend manual review for borderline cases
  const borderlineLevels = ['POSSIBLE'];

  return Object.values(result.safeSearch).some(level =>
    borderlineLevels.includes(level)
  ) || result.blockedReasons.some(reason => reason.includes('API Error'));
}

/**
 * Convert File to Buffer for safety scanning
 */
export function fileToBuffer(file: File): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const buffer = Buffer.from(arrayBuffer);
      resolve(buffer);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
