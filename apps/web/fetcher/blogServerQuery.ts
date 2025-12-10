
import { serverFetcher } from './serverFetcher';

const BASEURL = process.env.BFF_ARTICLE_HOST_API as string;

export const fetchTrendingArticles = async (start: number, limit: number, type: string) => {
  try {
    const response = await serverFetcher(BASEURL, `/post/getPosts?start=${start}&limit=${limit}&type=${type}`, {
      next: { revalidate: 3600 }
    });
    return response?.data || [];
  } catch (error) {
    console.log(' fetchTrendingArticles :: error:', error)

  }
};
