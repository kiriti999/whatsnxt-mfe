import { bffApiClient } from '@whatsnxt/core-util';

export const AnalyticsAPI = {
  fetchViews: async function () {
    const { data } = await bffApiClient.get('/analytics/fetchViews');
    return data.data?.analytics;
  },
};