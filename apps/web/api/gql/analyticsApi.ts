import api from '@whatsnxt/core-util/src/GraphqlClient';

const GET_ANALYTICS_QUERY = () => `
  query GetAnalytics {
    analytics {
      rowCount
      rows {
        dimensionValues {
          value
          oneValue
        }
        metricValues {
          value
          oneValue
        }
      }
    }
  }
`;

export const AnalyticsAPI = {
  fetchViews: async function () {
    const { data } = await api.request({
      data: {
        query: GET_ANALYTICS_QUERY
      }
    });
    return data.data.analytics;
  }
}
