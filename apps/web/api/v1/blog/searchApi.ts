import { blogApiClient } from '@whatsnxt/core-util';

export const ElasticSearchAPI = {
  search: async function (searchString: string) {
    const response = await blogApiClient.get(`/content/search?title=${searchString}`);
    return response?.data || [];
  },
};