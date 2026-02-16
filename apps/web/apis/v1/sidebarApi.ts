import { courseApiClient } from '@whatsnxt/core-util';

export const SidebarAPI = {
  getPopular: async function () {
    const response = await courseApiClient.get('/popular');

    // returning the data returned by the API
    return response?.data || [];
  },
};