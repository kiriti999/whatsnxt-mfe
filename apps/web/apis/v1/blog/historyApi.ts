import { articleApiClient } from '@whatsnxt/core-util';

import { historyFilterType } from '../../../types/history';


export const HistoryAPI = {
  getHistory: async function (
    start: number,
    limit: number,
    search: string,
    filter?: historyFilterType,
  ) {
    let queryString = `start=${start}&limit=${limit}&type=both&search=${encodeURIComponent(search)}`;

    if (filter) {
      if (filter.startDateParam) {
        queryString += `&startDateParam=${encodeURIComponent(filter.startDateParam)}`;
      }
      if (filter.endDateParam) {
        queryString += `&endDateParam=${encodeURIComponent(filter.endDateParam)}`;
      }
      if (filter.searchInput) {
        queryString += `&searchInput=${encodeURIComponent(filter.searchInput)}`;
      }
      if (filter.selectedOptions) {
        queryString += `&selectedOptions=${encodeURIComponent(JSON.stringify(filter.selectedOptions))}`;
      }
    }

    const { data } = await articleApiClient.get(`/history/getHistory?${queryString}`) as { data: any };

    return data ? data : [];
  },

  downloadEBook: async function (id: string) {
    const { data } = await articleApiClient.get('/history/downloadEBook', {
      params: { id }
    }) as { data: any };

    return data.data ? data.data.generateEbook : '';
  },

  downloadPDF: async function (id: string) {
    const { data } = await articleApiClient.get('/history/downloadPDF', {
      params: { id }
    }) as { data: any };

    return data.data ? data.data.generatePDF : '';
  },

  downloadPPT: async function (id: string) {
    const { data } = await articleApiClient.get('/history/downloadPPT', {
      params: { id }
    }) as { data: any };

    return data.data ? data.data.generatePPT : '';
  },

  publishDraft: async function (id: string, shouldPublish: boolean) {
    const { data } = await articleApiClient.put('/history/publishDraft', {
      postId: id,
      shouldPublish
    }) as { data: any };

    return data.data ? data.data.publishPost : '';
  },
};