
import { serverFetcher } from './serverFetcher';

const BASEURL = process.env.BFF_ARTICLE_HOST_API as string;

export const fetchTrendingArticles = async (start: number, limit: number, type: string) => {
  try {
    const response = await serverFetcher(BASEURL, `/post/getPosts?start=${start}&limit=${limit}&type=${type}`, {
      next: { revalidate: 300 }
    });
    return response?.data || [];
  } catch (error) {
    console.log(' fetchTrendingArticles :: error:', error)

  }
};

export const fetchStructuredTutorials = async (page: number, limit: number) => {
  try {
    const response = await serverFetcher(BASEURL, `/structured-tutorial?page=${page}&limit=${limit}&published=true`, {
      next: { revalidate: 300 }
    });
    return response?.data || { tutorials: [], total: 0 };
  } catch (error) {
    console.log(' fetchStructuredTutorials :: error:', error);
    return { tutorials: [], total: 0 };
  }
};

/**
 * Fetch trending content ordered by Google Analytics page views (last 30 days).
 * @param limit   Number of items (default 8, max 20)
 * @param type    "blog" | "tutorial" | "structured-tutorial" | "all"
 */
export const fetchGATrendingContent = async (
  limit = 8,
  type: 'blog' | 'tutorial' | 'structured-tutorial' | 'all' = 'all',
) => {
  try {
    const response = await serverFetcher(
      BASEURL,
      `/post/getGATrending?limit=${limit}&type=${type}`,
      { next: { revalidate: 300 } }, // 5-minute cache matching Redis TTL
    );
    return {
      articles: response?.data || [],
      total: response?.total || 0,
    };
  } catch (error) {
    console.log('fetchGATrendingContent :: error:', error);
    return { articles: [], total: 0 };
  }
};
