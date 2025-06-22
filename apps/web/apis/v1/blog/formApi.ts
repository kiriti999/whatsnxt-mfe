import { articleApiClient } from '@whatsnxt/core-util';

export const FormAPI = {
  createBlog: async function (payload: any) {
    const { data } = await articleApiClient.post('/post/createBlog', {
      title: payload.title,
      description: payload.description,
      contentFormat: payload.contentFormat || 'HTML',
      categoryName: payload.categoryName,
      categoryId: payload.categoryId || null,
      subCategory: payload.subCategory || null,
      nestedSubCategory: payload.nestedSubCategory || null,
      cloudinaryAssets: payload.cloudinaryAssets || null,
      imageUrl: payload.imageUrl || null,
      wordCount: payload.wordCount
    });
    return data ? data : {};
  },

  updateBlog: async function (id: string, payload: any) {
    const { data } = await articleApiClient.put(`/history/editBlog/${id}`, {
      id,
      title: payload.title,
      description: payload.description,
      contentFormat: payload.contentFormat || 'HTML',
      categoryName: payload.categoryName,
      categoryId: payload.categoryId,
      subCategory: payload.subCategory || null,
      imageUrl: payload.imageUrl || null,
      nestedSubCategory: payload.nestedSubCategory || null,
      cloudinaryAssets: payload.cloudinaryAssets || null,
      wordCount: payload.wordCount
    });
    return data ? data : {};
  },

  createTutorial: async function (payload: any) {
    const { data } = await articleApiClient.post('/tutorial/createTutorial', {
      title: payload.title,
      description: payload.description || '',
      categoryName: payload.categoryName,
      subCategory: payload.subCategory || null,
      imageUrl: payload.imageUrl || null,
      nestedSubCategory: payload.nestedSubCategory || null,
      categoryId: payload.categoryId,
      tutorials: payload.tutorials,
      published: false,
      cloudinaryAssets: payload.cloudinaryAssets || null
    });
    return data ? data : {};
  },

  updateTutorial: async function (id: string, payload: any) {
    const { data } = await articleApiClient.put(`/history/editTutorial/${id}`, {
      id,
      title: payload.title,
      description: payload.description || '',
      categoryName: payload.categoryName,
      subCategory: payload.subCategory || null,
      imageUrl: payload.imageUrl || null,
      nestedSubCategory: payload.nestedSubCategory || null,
      categoryId: payload.categoryId,
      tutorials: payload.tutorials,
      published: false,
      cloudinaryAssets: payload.cloudinaryAssets || null
    });
    return data ? data : {};
  },
};