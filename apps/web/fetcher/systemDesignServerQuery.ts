import { getArticleBffServerBaseUrl } from "./getArticleBffServerBaseUrl";
import { serverFetcher } from "./serverFetcher";

export const fetchPublishedSystemDesigns = async (
    limit = 8,
    filters?: { topic?: string; company?: string; difficulty?: string; category?: string },
): Promise<any[]> => {
    const topic = filters?.topic?.trim() ?? "";
    const company = filters?.company?.trim() ?? "";
    const difficulty = filters?.difficulty?.trim() ?? "";
    const category = filters?.category?.trim() ?? "";

    const q = new URLSearchParams();
    q.set("limit", String(limit));
    if (topic) q.set("topic", topic);
    if (company) q.set("company", company);
    if (difficulty) q.set("difficulty", difficulty);
    if (category) q.set("category", category);

    const hasFilters = Boolean(topic || company || difficulty || category);

    const response = await serverFetcher(
        getArticleBffServerBaseUrl(),
        `/system-design/published?${q.toString()}`,
        hasFilters ? { cache: "no-store" as const } : { next: { revalidate: 300 } },
    );
    return response?.data || [];
};

export const fetchSystemDesignPublicStats = async (): Promise<{
    publishedCourses: number;
    publishedInterviewExperiences: number;
    completedPracticeSessions: number;
}> => {
    const response = await serverFetcher(getArticleBffServerBaseUrl(), "/system-design/stats", {
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
    const response = await serverFetcher(getArticleBffServerBaseUrl(), `/system-design/slug/${slug}`, {
        next: { revalidate: 300 },
    });
    return response?.data || null;
};
