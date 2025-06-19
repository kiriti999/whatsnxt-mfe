import { blogApiClient } from '@whatsnxt/core-util';

export const AnalyticsAPI = {
  fetchViews: async function () {
    const { data } = await blogApiClient.get('/analytics/fetchViews');
    return data.data?.analytics;
  },
};