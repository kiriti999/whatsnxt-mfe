/**
 * Section Links API Client
 * Feature: 002-reusable-sections
 * 
 * Handles section linking operations - create, read, update, delete links
 * between sections and content (tutorials/blogs).
 */

import xior from 'xior';
import type {
  SectionLink,
  SectionLinkWithDetails,
  CreateSectionLinkInput,
  UpdateSectionLinkOrderInput,
  SectionLinkResponse,
  SectionLinksResponse,
} from '../../../types/sectionLink';

const sidebarApiClient = xior.create({
  baseURL: process.env.NEXT_PUBLIC_BFF_HOST || 'http://localhost:4444',
  withCredentials: true,
});

export const SectionLinksAPI = {
  /**
   * Get all section links for a specific content
   * Returns links sorted by order (ascending)
   */
  getLinksForContent: async function (contentId: string): Promise<SectionLink[]> {
    try {
      const response = await sidebarApiClient.get<SectionLinksResponse>(
        `/api/v1/sidebar/section-links?contentId=${contentId}`
      );
      return response?.data?.data || [];
    } catch (error) {
      console.error('SectionLinksAPI::getLinksForContent error:', error);
      return [];
    }
  },

  /**
   * Get section links with populated section details
   * Useful for displaying linked sections in sidebar
   */
  getLinksWithDetails: async function (contentId: string): Promise<SectionLinkWithDetails[]> {
    try {
      const response = await sidebarApiClient.get<{ success: boolean; data: SectionLinkWithDetails[] }>(
        `/api/v1/sidebar/section-links?contentId=${contentId}&populate=section`
      );
      return response?.data?.data || [];
    } catch (error) {
      console.error('SectionLinksAPI::getLinksWithDetails error:', error);
      return [];
    }
  },

  /**
   * Create a new section link
   * If order is not provided, the link will be appended at the end
   */
  createLink: async function (input: CreateSectionLinkInput): Promise<SectionLink> {
    const response = await sidebarApiClient.post<SectionLinkResponse>(
      '/api/v1/sidebar/section-links',
      input
    );
    return response.data.data;
  },

  /**
   * Update the order of a section link (for reordering)
   */
  updateLinkOrder: async function (linkId: string, input: UpdateSectionLinkOrderInput): Promise<SectionLink> {
    const response = await sidebarApiClient.patch<SectionLinkResponse>(
      `/api/v1/sidebar/section-links/${linkId}/reorder`,
      input
    );
    return response.data.data;
  },

  /**
   * Delete a section link (unlink section from content)
   * This will orphan all posts in this section for this content
   */
  deleteLink: async function (linkId: string): Promise<boolean> {
    try {
      const response = await sidebarApiClient.delete(`/api/v1/sidebar/section-links/${linkId}`);
      return response?.data?.success || false;
    } catch (error) {
      console.error('SectionLinksAPI::deleteLink error:', error);
      return false;
    }
  },

  /**
   * Bulk reorder section links for a content
   * Input: Array of { linkId, order } pairs
   */
  bulkReorder: async function (
    contentId: string,
    updates: Array<{ linkId: string; order: number }>
  ): Promise<boolean> {
    try {
      const response = await sidebarApiClient.patch('/api/v1/sidebar/section-links/bulk-reorder', {
        contentId,
        updates,
      });
      return response?.data?.success || false;
    } catch (error) {
      console.error('SectionLinksAPI::bulkReorder error:', error);
      return false;
    }
  },
};
