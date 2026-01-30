/**
 * OrphanedPost Type Definition
 * 
 * Represents posts that have lost their section association due to section unlinking.
 * These posts have sectionId = null and need to be reassigned to a new section.
 */

export interface OrphanedPost {
  _id: string;              // MongoDB ObjectId (Post._id)
  title: string;            // Post title
  slug: string;             // URL-friendly identifier
  contentType: 'blog' | 'tutorial';
  contentId: string;        // Reference to Tutorial._id or Blog._id
  sectionId: null;          // Always null for orphaned posts
  sectionOrder: number;     // Previous position within section
  createdAt: string;        // ISO 8601 timestamp
  updatedAt: string;        // ISO 8601 timestamp
  orphanedAt?: string;      // When the post became orphaned (computed)
}

/**
 * Reassign orphaned post request payload
 */
export interface ReassignOrphanedPostRequest {
  sectionId: string;        // New section to assign the post to
  order?: number;           // Optional: position within new section
}

/**
 * Bulk reassign orphaned posts request payload
 */
export interface BulkReassignOrphanedPostsRequest {
  postIds: string[];        // Array of orphaned post IDs
  sectionId: string;        // New section to assign all posts to
}

/**
 * Orphaned posts summary (computed statistics)
 */
export interface OrphanedPostsSummary {
  contentId: string;
  contentType: 'blog' | 'tutorial';
  orphanedCount: number;
  posts: OrphanedPost[];
}
