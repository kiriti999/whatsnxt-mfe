import xior from 'xior';

const sidebarApiClient = xior.create({
  baseURL: process.env.NEXT_PUBLIC_BFF_HOST || 'http://localhost:4444',
  withCredentials: true,
});

export interface SectionPost {
  _id: string;
  title: string;
  slug: string;
  sectionId: string;
  sectionOrder: number;
}

export interface Section {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  iconName?: string;
  contentType: 'blog' | 'tutorial';
  trainerId: string;           // Owner of the section
  parentId?: string;
  depth: number;
  order: number;
  isVisible: boolean;
  postCount: number;
  children?: Section[];
  posts?: SectionPost[];
  createdAt: string;
  updatedAt: string;
}

export interface SectionCreateInput {
  title: string;
  slug?: string;
  description?: string;
  iconName?: string;
  contentType: 'blog' | 'tutorial';
  trainerId: string;           // Required: owner of the section
  parentId?: string;
  order?: number;
  isVisible?: boolean;
}

export interface SectionUpdateInput {
  title?: string;
  slug?: string;
  description?: string;
  iconName?: string;
  order?: number;
  isVisible?: boolean;
}

export interface SectionTreeResponse {
  success: boolean;
  data: Section[];
  total: number;
}

export interface SectionResponse {
  success: boolean;
  data: Section;
}

export interface BreadcrumbItem {
  _id: string;
  title: string;
  slug: string;
}

export interface BreadcrumbResponse {
  success: boolean;
  data: BreadcrumbItem[];
}

export const SectionsAPI = {
  /**
   * List all sections with optional filtering
   */
  listSections: async function (params?: {
    contentType?: 'blog' | 'tutorial';
    trainerId?: string;
    parentId?: string | null;
    isVisible?: boolean;
    includeHidden?: boolean;
  }): Promise<Section[]> {
    const queryParams = new URLSearchParams();
    if (params?.contentType) queryParams.append('contentType', params.contentType);
    if (params?.trainerId) queryParams.append('trainerId', params.trainerId);
    if (params?.parentId !== undefined) queryParams.append('parentId', params.parentId || 'null');
    if (params?.isVisible !== undefined) queryParams.append('isVisible', String(params.isVisible));
    if (params?.includeHidden) queryParams.append('includeHidden', 'true');

    const query = queryParams.toString();
    const url = `/api/v1/sidebar/sections${query ? `?${query}` : ''}`;

    const response = await sidebarApiClient.get(url);
    return response?.data?.data || [];
  },

  /**
   * Get sections owned by a specific trainer
   * Useful for section picker - trainers can only link their own sections
   */
  getByTrainer: async function (trainerId: string, contentType?: 'blog' | 'tutorial'): Promise<Section[]> {
    try {
      return await this.listSections({
        trainerId,
        contentType,
        isVisible: true,
      });
    } catch (error) {
      console.error('SectionsAPI::getByTrainer error:', error);
      return [];
    }
  },

  /**
   * Get all sections (for admins)
   * T103: Admins can see all sections regardless of trainer
   */
  getAllSections: async function (contentType?: 'blog' | 'tutorial'): Promise<Section[]> {
    try {
      return await this.listSections({
        contentType,
        isVisible: true,
      });
    } catch (error) {
      console.error('SectionsAPI::getAllSections error:', error);
      return [];
    }
  },

  /**
   * Get hierarchical tree structure of sections
   */
  getTree: async function (contentType: 'blog' | 'tutorial', includePosts: boolean = false): Promise<Section[]> {
    const response = await sidebarApiClient.get<SectionTreeResponse>(
      `/api/v1/sidebar/sections/tree?contentType=${contentType}&includePosts=${includePosts}`
    );
    return response?.data?.data || [];
  },

  /**
   * Get single section by ID
   */
  getById: async function (id: string): Promise<Section | null> {
    try {
      const response = await sidebarApiClient.get<SectionResponse>(`/api/v1/sidebar/sections/${id}`);
      return response?.data?.data || null;
    } catch (error) {
      console.error('SectionsAPI::getById error:', error);
      return null;
    }
  },

  /**
   * Get section by slug
   */
  getBySlug: async function (slug: string, contentType: 'blog' | 'tutorial'): Promise<Section | null> {
    try {
      const response = await sidebarApiClient.get<SectionResponse>(
        `/api/v1/sidebar/sections/slug/${slug}?contentType=${contentType}`
      );
      return response?.data?.data || null;
    } catch (error) {
      console.error('SectionsAPI::getBySlug error:', error);
      return null;
    }
  },

  /**
   * Get breadcrumb trail for a section
   */
  getBreadcrumb: async function (sectionId: string): Promise<BreadcrumbItem[]> {
    const response = await sidebarApiClient.get<BreadcrumbResponse>(
      `/api/v1/sidebar/sections/${sectionId}/breadcrumb`
    );
    return response?.data?.data || [];
  },

  /**
   * Create new section (admin only)
   */
  createSection: async function (input: SectionCreateInput): Promise<Section> {
    const response = await sidebarApiClient.post<SectionResponse>('/api/v1/sidebar/sections', input);
    return response.data.data;
  },

  /**
   * Update existing section (admin only)
   */
  updateSection: async function (id: string, input: SectionUpdateInput): Promise<Section> {
    const response = await sidebarApiClient.patch<SectionResponse>(`/api/v1/sidebar/sections/${id}`, input);
    return response.data.data;
  },

  /**
   * Delete section (admin only)
   */
  deleteSection: async function (id: string): Promise<boolean> {
    const response = await sidebarApiClient.delete(`/api/v1/sidebar/sections/${id}`);
    return response?.data?.success || false;
  },

  /**
   * Reorder sections (admin only)
   */
  reorderSections: async function (updates: Array<{ _id: string; order: number }>): Promise<boolean> {
    const response = await sidebarApiClient.patch('/api/v1/sidebar/sections/reorder', { updates });
    return response?.data?.success || false;
  },

  /**
   * Get usage statistics for a section (T069 [US7])
   * Shows where the section is being used (which tutorials/blogs)
   */
  getUsageStats: async function (sectionId: string): Promise<{
    usageCount: number;
    usedIn: Array<{
      contentId: string;
      contentType: 'blog' | 'tutorial';
      contentTitle: string;
      contentSlug?: string;
    }>;
  }> {
    const response = await sidebarApiClient.get(`/api/v1/sidebar/sections/${sectionId}/usage`);
    return response?.data?.data || { usageCount: 0, usedIn: [] };
  },

  /**
   * Get detailed usage information for a section (T069, T070)
   * Returns usage count and list of content where section is used
   */
  getUsageDetails: async function (sectionId: string): Promise<{
    totalLinks: number;
    usedIn: Array<{
      contentId: string;
      contentType: 'blog' | 'tutorial';
      contentTitle: string;
      contentSlug?: string;
    }>;
  }> {
    const response = await sidebarApiClient.get(`/api/v1/sidebar/sections/${sectionId}/usage`);
    const data = response?.data?.data || { usageCount: 0, usedIn: [] };
    return {
      totalLinks: data.usageCount,
      usedIn: data.usedIn,
    };
  },
};
