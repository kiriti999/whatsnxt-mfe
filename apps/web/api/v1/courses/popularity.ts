import { courseApiClient } from '@whatsnxt/core-util';

export const PopularityAPI = {
  popularity: async function () {
    const response = await courseApiClient.get('/courses/popularity');
    return response;
  },
};