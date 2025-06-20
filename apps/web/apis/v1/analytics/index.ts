import { courseApiClient } from '@whatsnxt/core-util';

export const AnalyticsAPI = {
  getData: async function () {
    const response = await courseApiClient.get('/analytics');
    return response.data;
  },
  fetchViews: async function () {
    const response = await courseApiClient.get('/analytics');
    return response.data;
  }
};