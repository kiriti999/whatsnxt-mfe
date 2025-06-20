import { courseApiClient } from '@whatsnxt/core-util';

export const CategoriesAPI = {
  getCategories: async function () {
    const response = await courseApiClient.get('/courses/categories');
    return response;
  },
  getCategory: async function ({ categoryName }) {
    const response = await courseApiClient.get(`/courses/categories/${categoryName}`);
    return response;
  }
};