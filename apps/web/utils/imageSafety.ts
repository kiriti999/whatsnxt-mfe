// Client-side utility for image safety checks
export interface SafeSearchResult {
  adult: string;
  spoof: string;
  medical: string;
  violence: string;
  racy: string;
}

export interface ImageSafetyResponse {
  isSafe: boolean;
  safeSearch: SafeSearchResult;
}

export async function checkImageSafety(imageUrl: string): Promise<ImageSafetyResponse> {
  try {
    const response = await fetch('/api/image-safety', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check image safety');
    }

    return await response.json();
  } catch (error) {
    console.error('Image safety check failed:', error);
    throw error;
  }
}