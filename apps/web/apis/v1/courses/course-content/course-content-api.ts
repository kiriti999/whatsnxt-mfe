import { courseApiClient } from '@whatsnxt/core-util';

// Types for Course Content
export interface ComparisonTab {
    _id?: string;
    tabTitle: string;
    content: string;
    order: number;
}

export interface CollapsibleItem {
    _id?: string;
    title: string;
    content: string;
    order: number;
}

export interface AdditionalResource {
    _id?: string;
    title: string;
    description: string;
    url: string;
    resourceType: 'link' | 'text';
    order: number;
}

export interface CourseContentSection {
    _id?: string;
    courseId: string;
    title: string;
    overview: string;
    comparisons: {
        title: string;
        description: string;
        tabs: ComparisonTab[];
    };
    collapsibles: {
        title: string;
        description: string;
        items: CollapsibleItem[];
    };
    additionalResources: {
        title: string;
        items: AdditionalResource[];
    };
    order: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export const CourseContentAPI = {
    /**
     * Get all content sections for a course
     */
    getCourseContent: async (courseId: string): Promise<CourseContentSection[]> => {
        const response = await courseApiClient.get(`/courses/course-content/${courseId}`);
        return response.data?.data || [];
    },

    /**
     * Get a single content section by ID
     */
    getContentSection: async (sectionId: string): Promise<CourseContentSection> => {
        const response = await courseApiClient.get(`/courses/course-content/section/${sectionId}`);
        return response.data?.data;
    },

    /**
     * Create a new content section
     */
    createContentSection: async (courseId: string, data: Partial<CourseContentSection>): Promise<CourseContentSection> => {
        const response = await courseApiClient.post(`/courses/course-content/${courseId}`, data);
        return response.data?.data;
    },

    /**
     * Update a content section
     */
    updateContentSection: async (sectionId: string, data: Partial<CourseContentSection>): Promise<CourseContentSection> => {
        const response = await courseApiClient.put(`/courses/course-content/section/${sectionId}`, data);
        return response.data?.data;
    },

    /**
     * Delete a content section (soft delete)
     */
    deleteContentSection: async (sectionId: string): Promise<void> => {
        await courseApiClient.delete(`/courses/course-content/section/${sectionId}`);
    },

    /**
     * Reorder sections
     */
    reorderSections: async (courseId: string, sectionOrders: { sectionId: string; order: number }[]): Promise<CourseContentSection[]> => {
        const response = await courseApiClient.patch(`/courses/course-content/${courseId}/reorder`, { sectionOrders });
        return response.data?.data || [];
    },

    /**
     * Add a comparison tab to a section
     */
    addComparisonTab: async (sectionId: string, data: { tabTitle: string; content?: string }): Promise<CourseContentSection> => {
        const response = await courseApiClient.post(`/courses/course-content/section/${sectionId}/comparison-tab`, data);
        return response.data?.data;
    },

    /**
     * Remove a comparison tab from a section
     */
    removeComparisonTab: async (sectionId: string, tabId: string): Promise<CourseContentSection> => {
        const response = await courseApiClient.delete(`/courses/course-content/section/${sectionId}/comparison-tab/${tabId}`);
        return response.data?.data;
    },

    /**
     * Add a collapsible item to a section
     */
    addCollapsibleItem: async (sectionId: string, data: { title: string; content?: string }): Promise<CourseContentSection> => {
        const response = await courseApiClient.post(`/courses/course-content/section/${sectionId}/collapsible`, data);
        return response.data?.data;
    },

    /**
     * Remove a collapsible item from a section
     */
    removeCollapsibleItem: async (sectionId: string, itemId: string): Promise<CourseContentSection> => {
        const response = await courseApiClient.delete(`/courses/course-content/section/${sectionId}/collapsible/${itemId}`);
        return response.data?.data;
    },

    /**
     * Add an additional resource to a section
     */
    addResource: async (sectionId: string, data: { title: string; description?: string; url?: string; resourceType?: 'link' | 'text' }): Promise<CourseContentSection> => {
        const response = await courseApiClient.post(`/courses/course-content/section/${sectionId}/resource`, data);
        return response.data?.data;
    },

    /**
     * Remove a resource from a section
     */
    removeResource: async (sectionId: string, resourceId: string): Promise<CourseContentSection> => {
        const response = await courseApiClient.delete(`/courses/course-content/section/${sectionId}/resource/${resourceId}`);
        return response.data?.data;
    },
};
