// utils/imageSafety.ts - Client-side utilities

export interface SafeSearchResult {
  adult: string;
  spoof: string;
  medical: string;
  violence: string;
  racy: string;
}

export interface SafetyAnnotation {
  name: string;
  likelihood: string;
}

export interface ImageSafetyResult {
  isSafe: boolean;
  likelihood: string;
  annotations: SafetyAnnotation[];
  safeSearch: SafeSearchResult;
  filename?: string;
  error?: string;
}

export class ImageSafetyClient {
  private static readonly API_ENDPOINT = '/api/image-safety';

  /**
   * Convert File to ArrayBuffer
   */
  static async fileToBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Check image safety by uploading file data
   */
  static async checkImageSafety(file: File): Promise<ImageSafetyResult> {
    try {
      const buffer = await this.fileToBuffer(file);

      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: Array.from(new Uint8Array(buffer)),
          filename: file.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: ImageSafetyResult = await response.json();
      result.filename = file.name;
      return result;
    } catch (error) {
      console.error('Image safety check failed:', error);
      return {
        isSafe: false,
        likelihood: 'UNKNOWN',
        annotations: [],
        safeSearch: {
          adult: 'UNKNOWN',
          spoof: 'UNKNOWN',
          medical: 'UNKNOWN',
          violence: 'UNKNOWN',
          racy: 'UNKNOWN',
        },
        filename: file.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check image safety by URL
   */
  static async checkImageSafetyByUrl(imageUrl: string): Promise<ImageSafetyResult> {
    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Image safety check failed:', error);
      return {
        isSafe: false,
        likelihood: 'UNKNOWN',
        annotations: [],
        safeSearch: {
          adult: 'UNKNOWN',
          spoof: 'UNKNOWN',
          medical: 'UNKNOWN',
          violence: 'UNKNOWN',
          racy: 'UNKNOWN',
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get human-readable safety summary
   */
  static getSafetySummary(result: ImageSafetyResult): string {
    if (result.error) {
      return `Error: ${result.error}`;
    }

    if (result.isSafe) {
      return 'Image appears safe for upload';
    }

    const violations: string[] = [];
    const { safeSearch } = result;

    if (safeSearch.adult === 'LIKELY' || safeSearch.adult === 'VERY_LIKELY') {
      violations.push('adult content');
    }
    if (safeSearch.violence === 'LIKELY' || safeSearch.violence === 'VERY_LIKELY') {
      violations.push('violence');
    }
    if (safeSearch.racy === 'LIKELY' || safeSearch.racy === 'VERY_LIKELY') {
      violations.push('racy content');
    }

    return violations.length > 0
      ? `Potential safety concerns detected: ${violations.join(', ')}`
      : 'Image may contain inappropriate content';
  }

  /**
   * Validate multiple files for safety
   */
  static async validateMultipleImages(files: File[]): Promise<ImageSafetyResult[]> {
    const promises = files.map(file => this.checkImageSafety(file));
    return Promise.all(promises);
  }

  /**
   * Check if any images in a batch are unsafe
   */
  static async hasUnsafeImages(files: File[]): Promise<boolean> {
    const results = await this.validateMultipleImages(files);
    return results.some(result => !result.isSafe);
  }
}

// Usage Examples:

// Example 1: Check single image file
export const handleFileUpload = async (file: File) => {
  const result = await ImageSafetyClient.checkImageSafety(file);

  if (!result.isSafe) {
    alert(`Image rejected: ${ImageSafetyClient.getSafetySummary(result)}`);
    return;
  }

  // Proceed with file upload
  console.log('Image is safe to upload');
};

// Example 2: Check image by URL
export const checkUrlImage = async (url: string) => {
  const result = await ImageSafetyClient.checkImageSafetyByUrl(url);
  console.log('Safety result:', ImageSafetyClient.getSafetySummary(result));
};

// Example 3: Batch validation
export const handleMultipleFiles = async (files: FileList) => {
  const fileArray = Array.from(files);
  const hasUnsafe = await ImageSafetyClient.hasUnsafeImages(fileArray);

  if (hasUnsafe) {
    alert('One or more images contain inappropriate content');
    return;
  }

  // All images are safe
  console.log('All images passed safety check');
};