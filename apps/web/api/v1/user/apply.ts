import { bffApiClient } from '@whatsnxt/core-util';

export const UserAPI = {
  apply: async function (payload) {
    const response = await bffApiClient.post('/user/apply', payload);
    return response.data;
  }
};