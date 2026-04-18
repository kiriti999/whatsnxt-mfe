import http from '@whatsnxt/http-client';

export interface ContentPlanTopic {
    _key: string;
    title: string;
    status: 'pending' | 'processing' | 'published' | 'error' | 'skipped';
    blogPostId?: string;
    error?: string;
    processedAt?: string;
    retryCount: number;
}

export interface ContentPlan {
    _id: string;
    title: string;
    description: string;
    userId: string;
    categoryName: string;
    subCategory?: string;
    nestedSubCategory?: string;
    topics: ContentPlanTopic[];
    status: 'active' | 'completed' | 'paused' | 'cancelled';
    completedCount: number;
    totalCount: number;
    lastProcessedAt?: string;
    rateLimitedUntil?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ContentPlanCreatePayload {
    title: string;
    description: string;
    categoryName: string;
    subCategory?: string;
    nestedSubCategory?: string;
    generateDiagrams?: boolean;
}

export const ContentPlanAPI = {
    create: async (payload: ContentPlanCreatePayload): Promise<{ message: string; data: ContentPlan }> => {
        return http.post('/content-plans', payload);
    },

    list: async (): Promise<{ data: ContentPlan[] }> => {
        return http.get('/content-plans');
    },

    getById: async (id: string): Promise<{ data: ContentPlan }> => {
        return http.get(`/content-plans/${id}`);
    },

    updateStatus: async (id: string, status: ContentPlan['status']): Promise<{ message: string; data: ContentPlan }> => {
        return http.patch(`/content-plans/${id}`, { status });
    },

    delete: async (id: string): Promise<void> => {
        return http.delete(`/content-plans/${id}`);
    },
};
