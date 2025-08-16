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

// Utility function to convert File to ArrayBuffer
export const fileToBuffer = async (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

// Scan image for safety using Google Vision API
export const scanImageSafety = async (buffer: ArrayBuffer, filename: string): Promise<ImageSafetyResult> => {
  try {
    const response = await fetch('/api/image-safety', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: Array.from(new Uint8Array(buffer)),
        filename,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Image safety scan failed:', error);
    return {
      isSafe: false,
      likelihood: 'UNKNOWN',
      annotations: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Validate image for safety with file input
export const validateImageForSafety = async (file: File): Promise<ImageSafetyResult> => {
  try {
    const buffer = await fileToBuffer(file);
    return await scanImageSafety(buffer, file.name);
  } catch (error) {
    console.error('Image validation failed:', error);
    return {
      isSafe: false,
      likelihood: 'UNKNOWN',
      annotations: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Get safety summary from result
export const getSafetySummary = (result: ImageSafetyResult): string => {
  if (result.error) {
    return `Error: ${result.error}`;
  }

  if (result.isSafe) {
    return 'Image appears safe for upload';
  }

  const violationTypes = result.annotations
    .filter(annotation => annotation.likelihood === 'LIKELY' || annotation.likelihood === 'VERY_LIKELY')
    .map(annotation => annotation.name)
    .join(', ');

  return violationTypes 
    ? `Potential safety concerns detected: ${violationTypes}`
    : 'Image may contain inappropriate content';
};

export const checkImageSafety = async (file: File): Promise<ImageSafetyResult> => {
  try {
    const buffer = await fileToBuffer(file);

    const response = await fetch('/api/image-safety', {
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Image safety check failed:', error);
    return {
      isSafe: false,
      likelihood: 'UNKNOWN',
      annotations: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};