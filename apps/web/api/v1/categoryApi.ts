import { courseApiClient } from '@whatsnxt/core-util';

export const CategoryAPI = {
  getCategories: async function () {
    const response = await courseApiClient.get('/courses/categories');

    // returning the data returned by the API
    console.log('CategoryAPI:: getCategories:: response: ', response?.data);
    return response?.data || [];
  },
  getArticleCountByCategory: async function () {
    const response = await courseApiClient.get('/articleCountByCategory');

    // returning the data returned by the API
    console.log(
      'CategoryAPI:: articleCountByCategory:: response: ',
      response?.data,
    );
    return response?.data || [];
  },
};