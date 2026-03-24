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
    sortOrder: number;
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
    createdAt: string;
    updatedAt: string;
}

export interface SystemDesignCreatePayload {
    title: string;
    category: string;
    sections: SystemDesignSection[];
    diagrams: SystemDesignDiagram[];
}

export interface SystemDesignUpdatePayload {
    title?: string;
    category?: string;
    sections?: SystemDesignSection[];
    diagrams?: SystemDesignDiagram[];
    status?: string;
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

    listPublished: async (
        category?: string,
    ): Promise<{ data: SystemDesignCourse[] }> => {
        const params = category ? `?category=${encodeURIComponent(category)}` : "";
        return http.get(`/system-design/published${params}`);
    },
};
