
import { useState, useCallback } from 'react';
import { 
  scanImageSafety, 
  validateImageForSafety, 
  getSafetySummary, 
  fileToBuffer,
  type ImageSafetyResult 
} from '../utils/imageSafety';

interface UseImageSafetyReturn {
  scanImage: (file: File) => Promise<ImageSafetyResult>;
  isScanning: boolean;
  error: string | null;
  clearError: () => void;
}

export function useImageSafety(): UseImageSafetyReturn {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanImage = useCallback(async (file: File): Promise<ImageSafetyResult> => {
    setIsScanning(true);
    setError(null);

    try {
      console.log('🔍 Hook: Starting image safety scan for:', file.name);

      // Validate file
      validateImageForSafety(file);

      // Convert to buffer
      const buffer = await fileToBuffer(file);

      // Perform safety scan
      const result = await scanImageSafety(buffer);

      console.log('✅ Hook: Safety scan completed:', result);

      if (!result.safe) {
        const summary = getSafetySummary(result);
        setError(summary);
      }

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Safety scan failed';
      console.error('❌ Hook: Safety scan error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    scanImage,
    isScanning,
    error,
    clearError,
  };
}
