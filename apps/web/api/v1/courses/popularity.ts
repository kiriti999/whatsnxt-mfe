import { bffApiClient } from '@whatsnxt/core-util';

export const PopularityAPI = {
  popularity: async function () {
    const response = await bffApiClient.get('/courses/popularity');
    return response;
  },
};