/**
 * Section Permission Constants
 * 
 * Defines permission levels for section ownership and access control.
 * Used to enforce trainer-scoped data access.
 */

export const SECTION_PERMISSIONS = {
  /**
   * Admin users have full access to all sections across all trainers
   * - Can view, edit, delete any section
   * - Can transfer ownership between trainers
   * - Can manage orphaned posts
   */
  ADMIN_FULL_ACCESS: 'admin_full_access',
  
  /**
   * Trainers can only access sections they own
   * - Can view, edit, delete only their own sections
   * - Can create new sections (auto-owned)
   * - Can link only their sections to their content
   * - Can request ownership transfer
   */
  TRAINER_OWN_ONLY: 'trainer_own_only',
} as const;

// Type for permission values
export type SectionPermission = typeof SECTION_PERMISSIONS[keyof typeof SECTION_PERMISSIONS];
