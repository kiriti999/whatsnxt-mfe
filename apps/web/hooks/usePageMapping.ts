/**
 * Custom hook for managing page number to page ID mapping
 * Feature: 004-page-editor-pagination
 * 
 * This hook fetches lab data and builds an in-memory cache mapping
 * page numbers to page IDs for quick navigation between pages.
 */

import { useState, useEffect, useCallback } from 'react';
import labApi from '@/apis/lab.api';
import type { PageMapping } from '@/types/pagination';
import type { LabPage } from '@whatsnxt/core-types';

interface UsePageMappingResult {
  pageMapping: PageMapping;
  isLoading: boolean;
  error: string | null;
  getPageId: (pageNumber: number) => string | undefined;
  refreshMapping: () => Promise<void>;
}

/**
 * Hook to manage page number to page ID mapping for pagination navigation
 * 
 * @param labId - The UUID of the lab
 * @returns {UsePageMappingResult} - Page mapping state and helper functions
 * 
 * @example
 * ```tsx
 * const { getPageId, isLoading, error } = usePageMapping(labId);
 * const targetPageId = getPageId(3); // Get page ID for page number 3
 * router.push(`/labs/${labId}/pages/${targetPageId}`);
 * ```
 */
export const usePageMapping = (labId: string): UsePageMappingResult => {
  const [pageMapping, setPageMapping] = useState<PageMapping>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches lab data and builds page number to page ID mapping
   */
  const fetchPageMapping = useCallback(async () => {
    if (!labId) {
      setError('Lab ID is required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch lab data with all pages
      const response = await labApi.getLabById(labId);
      
      if (!response?.data?.pages) {
        throw new Error('Lab pages data not found in response');
      }

      // Build mapping: pageNumber -> pageId
      const mapping = new Map<number, string>();
      response.data.pages.forEach((page: LabPage) => {
        mapping.set(page.pageNumber, page.id);
      });

      setPageMapping(mapping);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load page mapping';
      setError(errorMessage);
      console.error('Page mapping error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [labId]);

  /**
   * Initialize page mapping on mount and when labId changes
   */
  useEffect(() => {
    if (labId) {
      fetchPageMapping();
    }
  }, [labId, fetchPageMapping]);

  /**
   * Get page ID for a given page number
   * 
   * @param pageNumber - The page number (1-based)
   * @returns The page ID (UUID) or undefined if not found
   */
  const getPageId = useCallback((pageNumber: number): string | undefined => {
    return pageMapping.get(pageNumber);
  }, [pageMapping]);

  /**
   * Manually refresh the page mapping
   * Useful after new pages are created via auto-page-creation
   */
  const refreshMapping = useCallback(async (): Promise<void> => {
    await fetchPageMapping();
  }, [fetchPageMapping]);

  return {
    pageMapping,
    isLoading,
    error,
    getPageId,
    refreshMapping,
  };
};
