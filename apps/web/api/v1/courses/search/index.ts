import { algoliaSearchByKeyword } from '@whatsnxt/core-util';

export const SearchAPI = {
  /**
   * @desc This function is used to add algolia search to SearchForm component.
   * @param {string} query - The search query/keyword.
   * @returns {Promise<any[]>} - The search hits from Algolia.
   */
  search: async function (query) {
    try {
      const results = await searchIndexedPost(query);
      results && console.log(results?.hits);
      return results?.hits;
    } catch (error) {
      console.error('SearchAPI.search error:', error);
      throw error;
    }
  },
};

/**
 * @desc This function is used to send a request to the Algolia API and get a response.
 * @param {string} title - The search keyword/title.
 * @returns {Promise<any>} - The search results from Algolia.
 */
async function searchIndexedPost(title) {
  try {
    const indexName = process.env.NEXT_PUBLIC_ALGOLIA_COURSE_INDEX_NAME;
    const page = 0; // Default page
    const hitsPerPage = 10; // Number of results to fetch

    const results = await algoliaSearchByKeyword(indexName, title, page, hitsPerPage);
    console.log('searchIndexedPost:: results:', results);

    return results;
  } catch (error) {
    console.error('searchIndexedPost:: error:', error);
    throw error;
  }
}