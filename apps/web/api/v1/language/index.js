import { bffApiClient } from '@whatsnxt/core-util';

export const LanguageAPI = {
  getAll: async function () {
    const response = await bffApiClient.get('/language');
    return response;
  },
};