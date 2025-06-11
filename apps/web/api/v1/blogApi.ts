import { bffApiClient } from '@whatsnxt/core-util';

export const BlogAPI = {
  getPosts: async function (start, limit) {
    const response = await bffApiClient.get(`/posts?start=${start}&limit=${limit}`);
    console.log('BlogAPI:: getPosts:: response: ', response?.data);
    return response?.data || [];
  },
  getPostsById: async function (id) {
    const response = await bffApiClient.get(`/post/${id}`);
    console.log('BlogAPI:: getPostsById:: response: ', response?.data);
    return response?.data || [];
  },
  getPostsByCategory: async function (id) {
    const response = await bffApiClient.get(`/posts/category/${id}`);
    console.log('BlogAPI:: getPostsByCategory:: response: ', response?.data);
    return response?.data || [];
  },
};