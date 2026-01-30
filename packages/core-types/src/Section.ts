/**
 * Section Type Definition
 * 
 * Represents a reusable organizational unit that can be linked to multiple tutorials/blogs.
 * Sections have trainer-scoped ownership.
 */

export interface Section {
  _id: string;              // MongoDB ObjectId
  title: string;            // Display name (3-100 characters)
  slug: string;             // URL-friendly identifier
  description?: string;     // Optional long description
  iconName?: string;        // Tabler icon name (e.g., 'IconBook')
  contentType: 'blog' | 'tutorial';
  trainerId: string;        // Reference to Trainer._id (owner)
  parentId?: string;        // For hierarchical sections (nested)
  depth: number;            // Hierarchy level (0 = root, max 5)
  order: number;            // Global library display order (0-based)
  isVisible: boolean;       // Show/hide in library (default: true)
  createdAt: string;        // ISO 8601 timestamp
  updatedAt: string;        // ISO 8601 timestamp
}

/**
 * Section creation request payload
 */
export interface CreateSectionRequest {
  title: string;
  description?: string;
  iconName?: string;
  contentType: 'blog' | 'tutorial';
  trainerId: string;
  parentId?: string;
  isVisible?: boolean;
}

/**
 * Section update request payload
 */
export interface UpdateSectionRequest {
  title?: string;
  description?: string;
  iconName?: string;
  parentId?: string;
  order?: number;
  isVisible?: boolean;
}

/**
 * Section usage statistics (computed at runtime)
 */
export interface SectionUsageStats {
  sectionId: string;
  usageCount: number;
  usedIn: Array<{
    contentId: string;
    contentType: 'blog' | 'tutorial';
    contentTitle: string;
  }>;
}
