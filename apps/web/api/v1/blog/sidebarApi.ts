import { blogApiClient } from '@whatsnxt/core-util';

export const SidebarAPI = {
  getPopular: async function () {
    const { data } = await blogApiClient.get('/post/getPopularPosts') as any;

    return data.data
      ? data.data.popularPosts
      : [];
  },
};