import { serverFetcher } from "./serverFetcher";

const BASEURL = process.env.BFF_ARTICLE_HOST_API as string;

const getBaseUrl = () =>
    BASEURL?.replace(/\/blog$/, "")?.replace(/\/article$/, "") ?? "";

export const fetchPublishedSystemDesigns = async (
    limit = 8,
    filters?: { topic?: string; company?: string; difficulty?: string; category?: string },
): Promise<any[]> => {
    const q = new URLSearchParams();
    q.set("limit", String(limit));
    if (filters?.topic) q.set("topic", filters.topic);
    if (filters?.company) q.set("company", filters.company);
    if (filters?.difficulty) q.set("difficulty", filters.difficulty);
    if (filters?.category) q.set("category", filters.category);
    const response = await serverFetcher(getBaseUrl(), `/system-design/published?${q.toString()}`, {
        next: { revalidate: 300 },
    });
    return response?.data || [];
};

export const fetchSystemDesignPublicStats = async (): Promise<{
    publishedCourses: number;
    publishedInterviewExperiences: number;
    completedPracticeSessions: number;
}> => {
    const response = await serverFetcher(getBaseUrl(), "/system-design/stats", {
        next: { revalidate: 120 },
    });
    return (
        response?.data || {
            publishedCourses: 0,
            publishedInterviewExperiences: 0,
            completedPracticeSessions: 0,
        }
    );
};

export const fetchSystemDesignBySlug = async (slug: string) => {
    const response = await serverFetcher(getBaseUrl(), `/system-design/slug/${slug}`, {
        next: { revalidate: 300 },
    });
    return response?.data || null;
};
