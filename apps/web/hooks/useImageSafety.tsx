import { useState, useCallback } from 'react';
import {
  scanImageSafetyClientSide,
  validateImageForClientSafety,
  getClientSafetySummary,
  preloadNSFWModel,
  type ClientImageSafetyResult
} from '../utils/imageSafetyClient';

interface UseImageSafetyReturn {
  scanImageClientSide: (file: File) => Promise<ClientImageSafetyResult>;
  preloadModel: () => Promise<void>;
  isScanning: boolean;
  isModelLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useImageSafety(): UseImageSafetyReturn {
  const [isScanning, setIsScanning] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanImageClientSide = useCallback(async (file: File): Promise<ClientImageSafetyResult> => {
    setIsScanning(true);
    setError(null);

    try {
      console.log('🔍 Hook: Starting client-side AI safety scan for:', file.name);

      // Validate file for client-side scanning
      validateImageForClientSafety(file);

      // Perform client-side safety scan
      const result = await scanImageSafetyClientSide(file);

      console.log('✅ Hook: Client-side safety scan completed:', result);

      if (!result.safe) {
        const summary = getClientSafetySummary(result);
        setError(summary);
      }

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Client-side safety scan failed';
      console.error('❌ Hook: Client-side safety scan error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const preloadModel = useCallback(async (): Promise<void> => {
    setIsModelLoading(true);
    try {
      await preloadNSFWModel();
    } catch (err) {
      console.warn('⚠️ Hook: Failed to preload NSFW model:', err);
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    scanImageClientSide,
    preloadModel,
    isScanning,
    isModelLoading,
    error,
    clearError,
  };
}