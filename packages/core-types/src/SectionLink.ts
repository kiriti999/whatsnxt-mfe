/**
 * SectionLink Type Definition
 * 
 * Junction entity for many-to-many relationship between Section and Content (Tutorial/Blog).
 * Tracks which sections are linked to which content and their display order.
 * Same section CAN be linked multiple times to the same content with different order values.
 */

export interface SectionLink {
  _id: string;              // MongoDB ObjectId
  sectionId: string;        // Reference to Section._id
  contentId: string;        // Reference to Tutorial._id or Blog._id
  contentType: 'blog' | 'tutorial';
  order: number;            // Position within this specific content (0-based)
  createdAt: string;        // ISO 8601 timestamp
  updatedAt: string;        // ISO 8601 timestamp
}

/**
 * Create section link request payload
 */
export interface CreateSectionLinkRequest {
  sectionId: string;
  contentId: string;
  contentType: 'blog' | 'tutorial';
  order?: number;           // Optional: if not provided, append to end
}

/**
 * Update section link order request payload
 */
export interface UpdateSectionLinkOrderRequest {
  order: number;            // New position (0-based)
}

/**
 * Section link with populated section details (for UI display)
 */
export interface SectionLinkWithDetails extends SectionLink {
  section: {
    title: string;
    slug: string;
    iconName?: string;
    description?: string;
  };
}
