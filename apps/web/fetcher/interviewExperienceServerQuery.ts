import { getArticleBffServerBaseUrl } from "./getArticleBffServerBaseUrl";
import { serverFetcher } from "./serverFetcher";

export const fetchPublishedInterviewExperiences = async (limit = 24): Promise<any[]> => {
    const response = await serverFetcher(
        getArticleBffServerBaseUrl(),
        `/interview-experiences/published?limit=${limit}`,
        { next: { revalidate: 120 } },
    );
    return response?.data || [];
};

export const fetchInterviewExperienceBySlug = async (slug: string) => {
    const response = await serverFetcher(
        getArticleBffServerBaseUrl(),
        `/interview-experiences/slug/${encodeURIComponent(slug)}`,
        { cache: "no-store" },
    );
    return response?.data || null;
};
