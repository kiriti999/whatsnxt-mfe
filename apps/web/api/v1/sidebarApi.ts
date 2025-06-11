import { bffApiClient } from '@whatsnxt/core-util';

export const SidebarAPI = {
  getPopular: async function () {
    const response = await bffApiClient.get('/popular');

    // returning the data returned by the API
    console.log('SidebarAPI:: getPopular:: response: ', response?.data);
    return response?.data || [];
  },
};