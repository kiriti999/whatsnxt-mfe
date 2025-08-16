import { useState, useCallback } from 'react';
import { checkImageSafety, ImageSafetyResponse } from '../utils/imageSafety';

interface UseImageSafetyReturn {
  checkSafety: (imageUrl: string) => Promise<ImageSafetyResponse>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useImageSafety(): UseImageSafetyReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSafety = useCallback(async (imageUrl: string): Promise<ImageSafetyResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await checkImageSafety(imageUrl);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check image safety';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    checkSafety,
    isLoading,
    error,
    clearError,
  };
}