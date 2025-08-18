import * as tf from '@tensorflow/tfjs';
import * as nsfwjs from 'nsfwjs';

// NSFW.js model instance
let nsfwModel: any = null;
let modelLoading = false;

// Initialize NSFW.js model (client-side only)
async function getNSFWModel() {
    if (typeof window === 'undefined') {
        throw new Error('NSFW.js client-side scanning only - not available on server');
    }

    if (nsfwModel) {
        return nsfwModel;
    }

    if (modelLoading) {
        // Wait for existing loading to complete
        while (modelLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return nsfwModel;
    }

    try {
        console.log('🤖 NSFW.js: Loading AI model in browser...');
        modelLoading = true;

        // Load the NSFW.js model
        nsfwModel = await nsfwjs.load();

        console.log('✅ NSFW.js: AI model loaded successfully in browser');
        modelLoading = false;
        return nsfwModel;
    } catch (error) {
        modelLoading = false;
        console.error('❌ NSFW.js: Failed to load AI model in browser:', error);
        throw new Error(`Failed to load NSFW detection model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// NSFW detection result interface
export interface NSFWResult {
    Drawing: number;
    Hentai: number;
    Neutral: number;
    Porn: number;
    Sexy: number;
}

export interface ClientImageSafetyResult {
    safe: boolean;
    predictions: NSFWResult;
    blockedReasons: string[];
    confidence: 'low' | 'medium' | 'high';
    maxUnsafeScore: number;
    flaggedCategories: string[];
}

// Configure safety thresholds (more permissive than Google Vision)
const SAFETY_THRESHOLDS = {
    Porn: 0.4,     // Block if >40% confidence porn
    Sexy: 0.4,     // Block if >40% confidence sexy (more permissive)
    Hentai: 0.4,   // Block if >40% confidence hentai
    Drawing: 1.0,  // Don't block drawings
    Neutral: 1.0   // Don't block neutral content
};

/**
 * Scan image for inappropriate content using NSFW.js (CLIENT-SIDE ONLY)
 */
export async function scanImageSafetyClientSide(file: File): Promise<ClientImageSafetyResult> {
    if (typeof window === 'undefined') {
        throw new Error('Client-side image scanning not available on server');
    }

    try {
        console.log('🔍 NSFW.js: Starting CLIENT-SIDE AI safety scan...');
        console.log('📊 Image file size:', file.size, 'bytes');

        // Load the NSFW model
        const model = await getNSFWModel();

        // Create image element for processing
        console.log('🖼️ NSFW.js: Converting file to image element...');
        const imageTensor = await createImageTensorFromFile(file);

        // Run NSFW classification
        console.log('🤖 NSFW.js: Running AI classification in browser...');
        const predictions = await model.classify(imageTensor);

        // Clean up tensor to prevent memory leaks
        imageTensor.dispose();

        // Convert predictions array to object
        const predictionMap: NSFWResult = {
            Drawing: 0,
            Hentai: 0,
            Neutral: 0,
            Porn: 0,
            Sexy: 0
        };

        predictions.forEach((pred: any) => {
            predictionMap[pred.className as keyof NSFWResult] = pred.probability;
        });

        console.log('📊 NSFW.js: Classification results:', predictionMap);

        // Check against thresholds
        const blockedReasons: string[] = [];
        const flaggedCategories: string[] = [];
        let safe = true;
        let maxUnsafeScore = 0;

        Object.entries(SAFETY_THRESHOLDS).forEach(([category, threshold]) => {
            const score = predictionMap[category as keyof NSFWResult];
            if (score > threshold) {
                safe = false;
                blockedReasons.push(`${category}: ${(score * 100).toFixed(1)}%`);
                flaggedCategories.push(category);
            }

            // Track max unsafe score (excluding Neutral and Drawing)
            if (category !== 'Neutral' && category !== 'Drawing') {
                maxUnsafeScore = Math.max(maxUnsafeScore, score);
            }
        });

        // Determine confidence level
        let confidence: 'low' | 'medium' | 'high' = 'low';
        if (maxUnsafeScore > 0.8) {
            confidence = 'high';
        } else if (maxUnsafeScore > 0.5) {
            confidence = 'medium';
        }

        const resultSummary: ClientImageSafetyResult = {
            safe,
            predictions: predictionMap,
            blockedReasons,
            confidence,
            maxUnsafeScore,
            flaggedCategories
        };

        if (!safe) {
            console.error('❌ NSFW.js: Image FAILED client-side safety check:', {
                blockedReasons,
                confidence,
                maxUnsafeScore: (maxUnsafeScore * 100).toFixed(1) + '%',
                flaggedCategories
            });
        } else {
            console.log('✅ NSFW.js: Image PASSED client-side safety check');
        }

        return resultSummary;

    } catch (error) {
        console.error('❌ NSFW.js: CRITICAL client-side safety scan error:', error);
        throw new Error(`Client-side AI safety scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Create image tensor from File object (browser-only)
 */
async function createImageTensorFromFile(file: File): Promise<tf.Tensor> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                // Use tf.browser.fromPixels to create tensor from image
                const tensor = tf.browser.fromPixels(img);
                resolve(tensor.expandDims(0)); // Add batch dimension
            } catch (error) {
                reject(error);
            }
        };
        img.onerror = reject;

        // Create object URL from file
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;

        // Clean up object URL after image loads
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            try {
                const tensor = tf.browser.fromPixels(img);
                resolve(tensor.expandDims(0));
            } catch (error) {
                reject(error);
            }
        };
    });
}

/**
 * Validate image file before processing (client-side)
 */
export function validateImageForClientSafety(file: File): void {
    // Check file type
    if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
    }

    // Check file size (reasonable limit for AI processing)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        throw new Error('Image too large for AI safety scanning (max 50MB)');
    }

    // Check for supported formats
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
    if (!supportedTypes.includes(file.type)) {
        throw new Error('Unsupported image format for AI safety scanning');
    }
}

/**
 * Get human-readable safety summary
 */
export function getClientSafetySummary(result: ClientImageSafetyResult): string {
    if (result.safe) {
        return `Image passed client-side AI safety check (${(result.predictions.Neutral * 100).toFixed(1)}% neutral content)`;
    }

    const reasons = result.blockedReasons.join(', ');
    return `Image blocked by client-side AI: ${reasons}`;
}

/**
 * Check if manual review is recommended
 */
export function requiresClientManualReview(result: ClientImageSafetyResult): boolean {
    // Recommend manual review for borderline cases
    return result.maxUnsafeScore > 0.4 && result.maxUnsafeScore < 0.7;
}

/**
 * Get detailed analysis for admin review
 */
export function getClientDetailedAnalysis(result: ClientImageSafetyResult): string {
    const details = Object.entries(result.predictions)
        .map(([category, score]) => `${category}: ${(score * 100).toFixed(1)}%`)
        .join(', ');

    return `Client-side AI Analysis - ${details}`;
}

/**
 * Pre-load NSFW model for faster subsequent scans (browser-only)
 */
export async function preloadNSFWModel(): Promise<void> {
    if (typeof window === 'undefined') {
        console.warn('⚠️ NSFW.js: Preload only available in browser');
        return;
    }

    try {
        console.log('🚀 NSFW.js: Pre-loading AI model in browser...');
        await getNSFWModel();
        console.log('✅ NSFW.js: AI model pre-loaded successfully');
    } catch (error) {
        console.error('⚠️ NSFW.js: Failed to pre-load AI model:', error);
    }
}
