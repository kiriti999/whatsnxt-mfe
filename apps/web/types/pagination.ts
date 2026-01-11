// Pagination type definitions for page editor pagination feature
// Feature: 004-page-editor-pagination

/**
 * Client-side pagination state for UI management
 */
export interface PaginationState {
  currentPageNumber: number; // Current page number (1-based)
  totalPages: number; // Total number of pages in the lab
  currentPageId: string; // UUID of current page
  labId: string; // UUID of parent lab
  isNavigating: boolean; // Loading state during navigation
}

/**
 * Props for pagination component
 */
export interface PagePaginationProps {
  currentPage: number; // Current active page number
  totalPages: number; // Total number of pages
  onPageChange: (pageNumber: number) => void; // Callback when page is changed
  isLoading?: boolean; // Optional loading state
  isMobile?: boolean; // Optional mobile layout flag
}

/**
 * In-memory mapping of page numbers to page IDs for quick navigation
 */
export type PageMapping = Map<number, string>; // pageNumber -> pageId

/**
 * Result of a page navigation operation
 */
export interface NavigationResult {
  success: boolean; // Whether navigation was successful
  error?: string; // Error message if navigation failed
  redirectedTo?: number; // If redirected to different page than requested
}
