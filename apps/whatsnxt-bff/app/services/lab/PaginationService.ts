import { PAGINATION } from "@whatsnxt/constants";

/**
 * PaginationService for Lab Diagram Tests Feature
 *
 * Handles all pagination logic for listing resources.
 * Follows SOLID principles with single responsibility for pagination.
 * Max cyclomatic complexity: 5
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}

export class PaginationService {
  /**
   * Validates and normalizes pagination parameters
   * @param page - Requested page number
   * @param limit - Requested items per page
   * @returns Normalized pagination parameters
   */
  static validateAndNormalize(page?: number, limit?: number): PaginationParams {
    const normalizedPage = this.normalizePage(page);
    const normalizedLimit = this.normalizeLimit(limit);

    return {
      page: normalizedPage,
      limit: normalizedLimit,
    };
  }

  /**
   * Normalizes page number to valid value
   * @param page - Page number to normalize
   * @returns Valid page number (minimum 1)
   */
  private static normalizePage(page?: number): number {
    if (!page || page < 1) {
      return PAGINATION.DEFAULT_PAGE;
    }
    return Math.floor(page);
  }

  /**
   * Normalizes limit to valid value
   * @param limit - Limit to normalize
   * @returns Valid limit (between 1 and MAX_LIMIT)
   */
  private static normalizeLimit(limit?: number): number {
    if (!limit || limit < 1) {
      return PAGINATION.DEFAULT_LIMIT;
    }
    if (limit > PAGINATION.MAX_LIMIT) {
      return PAGINATION.MAX_LIMIT;
    }
    return Math.floor(limit);
  }

  /**
   * Calculates skip value for database queries
   * @param page - Page number
   * @param limit - Items per page
   * @returns Number of items to skip
   */
  static calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Calculates total pages from total items and limit
   * @param totalItems - Total number of items
   * @param limit - Items per page
   * @returns Total number of pages
   */
  static calculateTotalPages(totalItems: number, limit: number): number {
    if (totalItems === 0) {
      return 0;
    }
    return Math.ceil(totalItems / limit);
  }

  /**
   * Builds pagination metadata
   * @param page - Current page number
   * @param limit - Items per page
   * @param totalItems - Total number of items
   * @returns Pagination metadata object
   */
  static buildMetadata(
    page: number,
    limit: number,
    totalItems: number,
  ): PaginationMetadata {
    const totalPages = this.calculateTotalPages(totalItems, limit);

    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Builds a complete paginated response
   * @param data - Array of items for current page
   * @param page - Current page number
   * @param limit - Items per page
   * @param totalItems - Total number of items
   * @returns Paginated response with data and metadata
   */
  static buildResponse<T>(
    data: T[],
    page: number,
    limit: number,
    totalItems: number,
  ): PaginatedResponse<T> {
    const pagination = this.buildMetadata(page, limit, totalItems);

    return {
      data,
      pagination,
    };
  }

  /**
   * Gets pagination parameters for lab drafts
   * Uses default of 3 labs per page as per requirements
   * @param page - Requested page number
   * @returns Pagination parameters for lab drafts
   */
  static getLabDraftsPagination(page?: number): PaginationParams {
    return this.validateAndNormalize(page, PAGINATION.LABS_PER_PAGE);
  }
}

export default PaginationService;
