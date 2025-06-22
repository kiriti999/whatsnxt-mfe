import { articleApiClient } from '@whatsnxt/core-util';

export const CategoryAPI = {
  getCategories: async function () {
    const { data } = await articleApiClient.get('/category/getCategories');
    return data ? data : [];
  },

  getArticleCountByCategory: async function () {
    const { data } = await articleApiClient.get('/category/getArticleCountByCategory');
    return data ? data : [];
  },

  editCategory: async function ({
    categoryId,
    categoryName,
  }: {
    categoryId: string;
    categoryName: string;
  }) {
    const { data } = await articleApiClient.put('/blog/category/editCategory', {
      categoryId,
      categoryName,
    });
    return data.data;
  },
};