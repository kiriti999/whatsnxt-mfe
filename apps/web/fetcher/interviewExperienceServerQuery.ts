import { serverFetcher } from "./serverFetcher";

const getBaseUrl = () => {
    const BASEURL = process.env.BFF_ARTICLE_HOST_API as string;
    return BASEURL?.replace(/\/blog$/, "")?.replace(/\/article$/, "") ?? "";
};

export const fetchPublishedInterviewExperiences = async (limit = 24): Promise<any[]> => {
    const response = await serverFetcher(
        getBaseUrl(),
        `/interview-experiences/published?limit=${limit}`,
        { next: { revalidate: 120 } },
    );
    return response?.data || [];
};

export const fetchInterviewExperienceBySlug = async (slug: string) => {
    const response = await serverFetcher(
        getBaseUrl(),
        `/interview-experiences/slug/${encodeURIComponent(slug)}`,
        { cache: "no-store" },
    );
    return response?.data || null;
};
