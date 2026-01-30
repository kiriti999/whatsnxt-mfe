/**
 * Section API Endpoint Constants
 * 
 * Defines all API endpoints for section management, ownership, and linking.
 * Following the existing pattern of baseURL: process.env.NEXT_PUBLIC_BFF_HOST || 'http://localhost:4444'
 */

export const SECTION_API_ENDPOINTS = {
  // Section Management
  SECTIONS: '/api/v1/sidebar/sections',
  SECTION_BY_ID: (sectionId: string) => `/api/v1/sidebar/sections/${sectionId}`,
  SECTIONS_BY_TRAINER: (trainerId: string, contentType?: string) => {
    const base = `/api/v1/sidebar/sections?trainerId=${trainerId}`;
    return contentType ? `${base}&contentType=${contentType}` : base;
  },
  
  // Section Linking
  SECTION_LINKS: '/api/v1/sidebar/section-links',
  SECTION_LINK_BY_ID: (linkId: string) => `/api/v1/sidebar/section-links/${linkId}`,
  SECTION_LINKS_BY_CONTENT: (contentId: string) => `/api/v1/sidebar/section-links?contentId=${contentId}`,
  SECTION_LINK_REORDER: (linkId: string) => `/api/v1/sidebar/section-links/${linkId}/reorder`,
  
  // Ownership Management
  SECTION_OWNERSHIP_VALIDATE: (sectionId: string) => `/api/v1/sidebar/sections/${sectionId}/ownership/validate`,
  SECTION_OWNERSHIP_TRANSFER_REQUEST: (sectionId: string) => `/api/v1/sidebar/sections/${sectionId}/ownership/transfer`,
  SECTION_OWNERSHIP_TRANSFER_RESPOND: (transferId: string) => `/api/v1/sidebar/ownership-transfers/${transferId}/respond`,
  SECTION_OWNERSHIP_TRANSFER_LIST: (trainerId: string) => `/api/v1/sidebar/ownership-transfers?trainerId=${trainerId}`,
  
  // Orphaned Posts
  ORPHANED_POSTS: '/api/v1/sidebar/orphaned-posts',
  ORPHANED_POSTS_BY_CONTENT: (contentId: string) => `/api/v1/sidebar/orphaned-posts?contentId=${contentId}`,
  ORPHANED_POST_REASSIGN: (postId: string) => `/api/v1/sidebar/orphaned-posts/${postId}/reassign`,
} as const;

// Content types for sections
export const SECTION_CONTENT_TYPES = {
  BLOG: 'blog',
  TUTORIAL: 'tutorial',
} as const;

export type SectionContentType = typeof SECTION_CONTENT_TYPES[keyof typeof SECTION_CONTENT_TYPES];

// Section ownership transfer statuses
export const SECTION_TRANSFER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  CANCELLED: 'cancelled',
} as const;

export type SectionTransferStatus = typeof SECTION_TRANSFER_STATUS[keyof typeof SECTION_TRANSFER_STATUS];
