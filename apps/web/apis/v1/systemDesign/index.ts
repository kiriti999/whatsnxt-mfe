import http from "@whatsnxt/http-client";

export interface SystemDesignSection {
    key: string;
    title: string;
    content: string;
    isRequired: boolean;
    sortOrder: number;
}

export interface SystemDesignDiagram {
    key: string;
    title: string;
    content: string;
    isRequired?: boolean;
    sortOrder: number;
    practiceMode?: "starter-blocks" | "blank-canvas" | "scrambled-diagram" | "progressive-easy" | "progressive-hard";
}

export interface SystemDesignCompanyRef {
    name: string;
    logoUrl?: string;
}

export interface SystemDesignCourse {
    _id: string;
    title: string;
    slug: string;
    category: string;
    userId: string;
    sections: SystemDesignSection[];
    diagrams: SystemDesignDiagram[];
    status: "draft" | "published" | "archived";
    isPremium?: boolean;
    createdAt: string;
    updatedAt: string;
    topics?: string[];
    companies?: SystemDesignCompanyRef[];
    difficulty?: "" | "easy" | "medium" | "hard";
    interviewFrequency?: "" | "low" | "medium" | "high";
    estimatedMinutes?: number;
    relatedSlugs?: string[];
    outcomeHighlight?: string;
}

export interface SystemDesignCreatePayload {
    title: string;
    category: string;
    sections: SystemDesignSection[];
    diagrams: SystemDesignDiagram[];
    isPremium?: boolean;
    topics?: string[];
    companies?: SystemDesignCompanyRef[];
    difficulty?: string;
    interviewFrequency?: string;
    estimatedMinutes?: number;
    relatedSlugs?: string[];
    outcomeHighlight?: string;
}

export interface SystemDesignUpdatePayload {
    title?: string;
    category?: string;
    sections?: SystemDesignSection[];
    diagrams?: SystemDesignDiagram[];
    status?: string;
    isPremium?: boolean;
    topics?: string[];
    companies?: SystemDesignCompanyRef[];
    difficulty?: string;
    interviewFrequency?: string;
    estimatedMinutes?: number;
    relatedSlugs?: string[];
    outcomeHighlight?: string;
}

export interface SystemDesignPublicStats {
    publishedCourses: number;
    publishedInterviewExperiences: number;
    completedPracticeSessions: number;
}

export const SystemDesignAPI = {
    create: async (
        payload: SystemDesignCreatePayload,
    ): Promise<{ message: string; data: SystemDesignCourse }> => {
        return http.post("/system-design", payload);
    },

    list: async (): Promise<{ data: SystemDesignCourse[] }> => {
        return http.get("/system-design");
    },

    getById: async (id: string): Promise<{ data: SystemDesignCourse }> => {
        return http.get(`/system-design/${id}`);
    },

    getBySlug: async (slug: string): Promise<{ data: SystemDesignCourse }> => {
        return http.get(`/system-design/slug/${slug}`);
    },

    update: async (
        id: string,
        payload: SystemDesignUpdatePayload,
    ): Promise<{ message: string; data: SystemDesignCourse }> => {
        return http.put(`/system-design/${id}`, payload);
    },

    delete: async (id: string): Promise<void> => {
        return http.delete(`/system-design/${id}`);
    },

    listPublished: async (filters?: {
        category?: string;
        limit?: number;
        topic?: string;
        company?: string;
        difficulty?: string;
    }): Promise<{ data: SystemDesignCourse[] }> => {
        const q = new URLSearchParams();
        if (filters?.category) q.set("category", filters.category);
        if (filters?.limit != null) q.set("limit", String(filters.limit));
        if (filters?.topic) q.set("topic", filters.topic);
        if (filters?.company) q.set("company", filters.company);
        if (filters?.difficulty) q.set("difficulty", filters.difficulty);
        const qs = q.toString();
        return http.get(`/system-design/published${qs ? `?${qs}` : ""}`);
    },

    stats: async (): Promise<{ data: SystemDesignPublicStats }> => {
        return http.get("/system-design/stats");
    },
};
