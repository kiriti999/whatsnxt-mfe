import { courseApiClient } from '@whatsnxt/core-util';

export const LanguageAPI = {
  getAll: async function () {
    const response = await courseApiClient.get('/language');
    return response;
  },
};