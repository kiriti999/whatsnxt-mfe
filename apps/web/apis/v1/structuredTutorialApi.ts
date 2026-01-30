import xior from 'xior';

const apiClient = xior.create({
  baseURL: process.env.NEXT_PUBLIC_BFF_HOST || 'http://localhost:4444',
  withCredentials: true,
});

// Structured Tutorial Page interface
export interface StructuredTutorialPage {
  _id?: string;
  title: string;
  description: string;
  sectionId: string; // REQUIRED: Each page must belong to a section
  sectionOrder?: number;
  cloudinaryAssets?: Array<{
    public_id: string;
    resource_type: 'image' | 'video' | 'raw' | 'auto';
    url?: string;
    secure_url?: string;
    width?: number;
    height?: number;
    format?: string;
  }>;
}

// Main Structured Tutorial interface
export interface StructuredTutorial {
  _id: string;
  title: string;
  slug: string;
  categoryName: string;
  categoryId: string;
  imageUrl?: string;
  subCategory?: string;
  nestedSubCategory?: string;
  pages: StructuredTutorialPage[];
  linkedSectionIds: string[]; // REQUIRED: At least 1 section
  published: boolean;
  cloudinaryAssets?: any[];
  author?: {
    _id: string;
    name: string;
    email: string;
  };
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration?: number; // in minutes
  views?: number;
  likes?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Create input interface
export interface StructuredTutorialCreateInput {
  title: string;
  categoryName: string;
  categoryId?: string; // Will be filled by backend
  imageUrl?: string;
  description?: string;
  subCategory?: string;
  nestedSubCategory?: string;
  pages: StructuredTutorialPage[];
  linkedSectionIds: string[]; // REQUIRED: At least 1
  cloudinaryAssets?: any[];
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration?: number;
  userId?: string; // For auth, will be removed when proper auth is in place
}

// Update input interface
export interface StructuredTutorialUpdateInput {
  title?: string;
  categoryName?: string;
  imageUrl?: string;
  description?: string;
  subCategory?: string;
  nestedSubCategory?: string;
  pages?: StructuredTutorialPage[];
  linkedSectionIds?: string[]; // Must maintain at least 1
  cloudinaryAssets?: any[];
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration?: number;
}

// Response interfaces
export interface StructuredTutorialResponse {
  success: boolean;
  data: StructuredTutorial;
  message?: string;
}

export interface StructuredTutorialListResponse {
  success: boolean;
  data: StructuredTutorial[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API client
export const StructuredTutorialAPI = {
  /**
   * Create a new structured tutorial
   * Validates: At least 1 section, all pages have sections
   */
  async create(data: StructuredTutorialCreateInput): Promise<StructuredTutorial> {
    const response = await apiClient.post<StructuredTutorialResponse>(
      '/api/v1/structured-tutorials',
      data
    );
    return response.data.data;
  },

  /**
   * Get structured tutorial by ID
   */
  async getById(id: string): Promise<StructuredTutorial> {
    const response = await apiClient.get<StructuredTutorialResponse>(
      `/api/v1/structured-tutorials/${id}`
    );
    return response.data.data;
  },

  /**
   * Update structured tutorial
   * Validates: At least 1 section if linkedSectionIds is provided
   */
  async update(id: string, data: StructuredTutorialUpdateInput): Promise<StructuredTutorial> {
    const response = await apiClient.patch<StructuredTutorialResponse>(
      `/api/v1/structured-tutorials/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete structured tutorial
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; data: { message: string } }>(
      `/api/v1/structured-tutorials/${id}`
    );
    return {
      success: response.data.success,
      message: response.data.data.message,
    };
  },

  /**
   * Get all structured tutorials with pagination and filters
   */
  async getAll(options?: {
    page?: number;
    limit?: number;
    categoryName?: string;
    author?: string;
    published?: boolean;
  }): Promise<StructuredTutorialListResponse> {
    const params = new URLSearchParams();
    
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.categoryName) params.append('categoryName', options.categoryName);
    if (options?.author) params.append('author', options.author);
    if (options?.published !== undefined) params.append('published', options.published.toString());

    const response = await apiClient.get<StructuredTutorialListResponse>(
      `/api/v1/structured-tutorials?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Publish structured tutorial
   * Validates: At least 1 section, all pages have sections
   */
  async publish(id: string): Promise<StructuredTutorial> {
    const response = await apiClient.post<StructuredTutorialResponse>(
      `/api/v1/structured-tutorials/${id}/publish`
    );
    return response.data.data;
  },

  /**
   * Validate structured tutorial before submission
   * Client-side validation helper
   */
  validate(data: StructuredTutorialCreateInput | StructuredTutorialUpdateInput): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check if at least 1 section is linked
    if ('linkedSectionIds' in data) {
      if (!data.linkedSectionIds || data.linkedSectionIds.length === 0) {
        errors.push('Structured Tutorial must have at least 1 linked section');
      }

      // Check if all pages have section assignments
      if (data.pages && data.pages.length > 0) {
        const pagesWithoutSections = data.pages.filter(page => !page.sectionId);
        if (pagesWithoutSections.length > 0) {
          errors.push(`${pagesWithoutSections.length} page(s) are not assigned to a section`);
        }

        // Check if all page sections are in linkedSectionIds
        for (const page of data.pages) {
          if (page.sectionId && !data.linkedSectionIds.includes(page.sectionId)) {
            errors.push(`Page "${page.title}" is assigned to a section that is not linked`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
