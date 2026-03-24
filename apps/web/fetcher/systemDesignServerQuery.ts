import { serverFetcher } from "./serverFetcher";

const BASEURL = process.env.BFF_ARTICLE_HOST_API as string;

const getBaseUrl = () =>
    BASEURL?.replace(/\/blog$/, "")?.replace(/\/article$/, "") ?? "";

export const fetchPublishedSystemDesigns = async (limit = 8): Promise<any[]> => {
    const response = await serverFetcher(getBaseUrl(), `/system-design/published?limit=${limit}`, {
        next: { revalidate: 300 },
    });
    return response?.data || [];
};

export const fetchSystemDesignBySlug = async (slug: string) => {
    const response = await serverFetcher(getBaseUrl(), `/system-design/slug/${slug}`, {
        next: { revalidate: 300 },
    });
    return response?.data || null;
};
