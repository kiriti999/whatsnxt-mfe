import xior from 'xior';

const sidebarApiClient = xior.create({
  baseURL: process.env.NEXT_PUBLIC_BFF_HOST || 'http://localhost:4444',
  withCredentials: true,
});

export interface Icon {
  _id: string;
  name: string;
  displayName: string;
  category: string;
  tags: string[];
  createdAt: string;
}

export interface IconsResponse {
  success: boolean;
  data: Icon[];
  total: number;
}

export const IconsAPI = {
  /**
   * List all available icons for section assignment
   */
  listIcons: async function (params?: {
    category?: string;
    search?: string;
  }): Promise<Icon[]> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    const url = `/api/v1/sidebar/icons${query ? `?${query}` : ''}`;
    
    const response = await sidebarApiClient.get<IconsResponse>(url);
    return response?.data?.data || [];
  },

  /**
   * Get icon by name
   */
  getByName: async function (name: string): Promise<Icon | null> {
    try {
      const response = await sidebarApiClient.get<{ success: boolean; data: Icon }>(
        `/api/v1/sidebar/icons/${name}`
      );
      return response?.data?.data || null;
    } catch (error) {
      console.error('IconsAPI::getByName error:', error);
      return null;
    }
  },

  /**
   * Get list of icon categories
   */
  getCategories: async function (): Promise<string[]> {
    const response = await sidebarApiClient.get<{ success: boolean; data: string[] }>(
      '/api/v1/sidebar/icons/categories'
    );
    return response?.data?.data || [];
  },
};
