/**
 * SectionLink Type Definitions
 * Feature: 002-reusable-sections
 * 
 * Types for section linking functionality - enabling reusable sections
 * to be linked to multiple tutorials/blogs.
 */

export interface SectionLink {
  _id: string;
  sectionId: string;
  contentId: string;
  contentType: 'blog' | 'tutorial';
  order: number; // Position within content (0-based)
  createdAt: string;
  updatedAt: string;
}

export interface SectionLinkWithDetails extends SectionLink {
  section: {
    title: string;
    slug: string;
    iconName?: string;
    description?: string;
    trainerId: string;
  };
}

export interface CreateSectionLinkInput {
  sectionId: string;
  contentId: string;
  contentType: 'blog' | 'tutorial';
  order?: number; // Optional: auto-assigned if not provided
}

export interface UpdateSectionLinkOrderInput {
  order: number;
}

export interface SectionLinkResponse {
  success: boolean;
  data: SectionLink;
}

export interface SectionLinksResponse {
  success: boolean;
  data: SectionLink[];
  total: number;
}
