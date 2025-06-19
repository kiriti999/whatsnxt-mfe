import { courseApiClient } from '@whatsnxt/core-util';

export const UserAPI = {
  apply: async function (payload) {
    const response = await courseApiClient.post('/user/apply', payload);
    return response.data;
  }
};