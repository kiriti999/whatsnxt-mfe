import http from "@whatsnxt/http-client";

export interface InterviewExperience {
    _id: string;
    title: string;
    slug: string;
    userId: string;
    companyName: string;
    companyLogoUrl?: string;
    role?: string;
    tags: string[];
    body: string;
    relatedCourseSlugs?: string[];
    status: "draft" | "published";
    createdAt: string;
    updatedAt: string;
}

export interface InterviewExperienceCreatePayload {
    title: string;
    slug?: string;
    companyName: string;
    companyLogoUrl?: string;
    role?: string;
    tags?: string[];
    body: string;
    relatedCourseSlugs?: string[];
    status?: string;
}

export interface InterviewExperienceUpdatePayload {
    title?: string;
    companyName?: string;
    companyLogoUrl?: string;
    role?: string;
    tags?: string[];
    body?: string;
    relatedCourseSlugs?: string[];
    status?: string;
}

export const InterviewExperienceAPI = {
    listPublished: async (filters?: {
        company?: string;
        tag?: string;
        limit?: number;
    }): Promise<{ data: InterviewExperience[] }> => {
        const q = new URLSearchParams();
        if (filters?.company) q.set("company", filters.company);
        if (filters?.tag) q.set("tag", filters.tag);
        if (filters?.limit != null) q.set("limit", String(filters.limit));
        const qs = q.toString();
        return http.get(`/interview-experiences/published${qs ? `?${qs}` : ""}`);
    },

    getBySlug: async (slug: string): Promise<{ data: InterviewExperience }> => {
        return http.get(`/interview-experiences/slug/${encodeURIComponent(slug)}`);
    },

    listMine: async (): Promise<{ data: InterviewExperience[] }> => {
        return http.get("/interview-experiences");
    },

    getById: async (id: string): Promise<{ data: InterviewExperience }> => {
        return http.get(`/interview-experiences/${id}`);
    },

    create: async (
        payload: InterviewExperienceCreatePayload,
    ): Promise<{ message: string; data: InterviewExperience }> => {
        return http.post("/interview-experiences", payload);
    },

    update: async (
        id: string,
        payload: InterviewExperienceUpdatePayload,
    ): Promise<{ message: string; data: InterviewExperience }> => {
        return http.put(`/interview-experiences/${id}`, payload);
    },

    delete: async (id: string): Promise<void> => {
        return http.delete(`/interview-experiences/${id}`);
    },
};
