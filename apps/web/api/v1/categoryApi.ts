import { bffApiClient } from '@whatsnxt/core-util';

export const CategoryAPI = {
  getCategories: async function () {
    const response = await bffApiClient.get('/categories');

    // returning the data returned by the API
    console.log('CategoryAPI:: getCategories:: response: ', response?.data);
    return response?.data || [];
  },
  getArticleCountByCategory: async function () {
    const response = await bffApiClient.get('/articleCountByCategory');

    // returning the data returned by the API
    console.log(
      'CategoryAPI:: articleCountByCategory:: response: ',
      response?.data,
    );
    return response?.data || [];
  },
};