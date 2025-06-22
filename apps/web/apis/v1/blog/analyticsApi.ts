import { articleApiClient } from '@whatsnxt/core-util';

export const AnalyticsAPI = {
  fetchViews: async function () {
    const { data } = await articleApiClient.get('/analytics/fetchViews');
    return data.data?.analytics;
  },
};