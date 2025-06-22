import { articleApiClient } from '@whatsnxt/core-util';

export const SidebarAPI = {
  getPopular: async function () {
    const { data } = await articleApiClient.get('/post/getPopularPosts') as any;
    return data ? data : [];
  },
};