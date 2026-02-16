import { courseApiClient } from '@whatsnxt/core-util';

export const CategoryAPI = {
  getCategories: async function () {
    const response = await courseApiClient.get('/courses/categories');

    return response?.data?.categories || [];
  },
  getArticleCountByCategory: async function () {
    const response = await courseApiClient.get('/articleCountByCategory');

    // returning the data returned by the API
    return response?.data || [];
  },
};