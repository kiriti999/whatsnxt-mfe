import { bffApiClient } from '@whatsnxt/core-util';

export const CategoriesAPI = {
  getCategories: async function () {
    const response = await bffApiClient.get('/courses/categories');
    return response;
  },
  getCategory: async function ({ categoryName }) {
    const response = await bffApiClient.get(`/courses/categories/${categoryName}`);
    return response;
  }
};