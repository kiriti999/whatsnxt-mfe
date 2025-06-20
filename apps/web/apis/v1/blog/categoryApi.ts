import { blogApiClient } from '@whatsnxt/core-util';

export const CategoryAPI = {
  getCategories: async function () {
    const { data } = await blogApiClient.get('/category/getCategories');
    return data ? data : [];
  },

  getArticleCountByCategory: async function () {
    const { data } = await blogApiClient.get('/category/getArticleCountByCategory');
    return data ? data : [];
  },

  editCategory: async function ({
    categoryId,
    categoryName,
  }: {
    categoryId: string;
    categoryName: string;
  }) {
    const { data } = await blogApiClient.put('/blog/category/editCategory', {
      categoryId,
      categoryName,
    });
    return data.data;
  },
};