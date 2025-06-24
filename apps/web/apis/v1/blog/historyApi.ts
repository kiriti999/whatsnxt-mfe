import { articleApiClient } from '@whatsnxt/core-util';
import { getAlgoliaIndex } from '../../v1/blog/algolia/getAlgoliaIndex';
import { historyFilterType } from '../../../types/history';

const index = getAlgoliaIndex();

export const HistoryAPI = {
  getHistory: async function (
    start: number,
    limit: number,
    search: string,
    filter?: historyFilterType,
  ) {
    const params = new URLSearchParams({
      start: start.toString(),
      limit: limit.toString(),
      type: 'both',
      search: search
    });

    // Add filter to params if it exists
    if (filter) {
      params.append('filter', String(filter));
    }

    const { data } = await articleApiClient.get(`/history/getHistory?${params.toString()}`) as { data: any };

    return data ? data : [];
  },
};

createTutorialFromBlogs: async function (list: string[], title: string) {
  const { data } = await articleApiClient.post('/history/createTutorialFromBlogs', {
    blogIds: list,
    title
  }) as { data: any };

  return data.data ? data.data.CreateTutorialFromBlogs : {};
},

downloadEBook: async function (id: string) {
  const { data } = await articleApiClient.get('/history/downloadEBook', {
    id
  }) as { data: any };

  return data.data ? data.data.generateEbook : '';
},

downloadPDF: async function (id: string) {
  const { data } = await articleApiClient.get('/history/downloadPDF', {
    id
  }) as { data: any };

  return data.data ? data.data.generatePDF : '';
},

downloadPPT: async function (id: string) {
  const { data } = await articleApiClient.get('/history/downloadPPT', {
    id
  }) as { data: any };

  return data.data ? data.data.generatePPT : '';
},

deleteBlog: async function (id: string) {
  const { data } = await articleApiClient.delete(`/history/deleteBlog/${id}`, {
    postId: id
  }) as { data: any };

  if (data?.deletePost) index.deleteObject(id);
  return data.data ? data.data.deletePost : '';
},

deleteTutorial: async function (id: string) {
  const { data } = await articleApiClient.delete(`/history/deleteTutorial/${id}`, {
    tutorialId: id
  }) as { data: any };

  if (data?.deleteTutorial) index.deleteObject(id);
  return data.data ? data.data.deleteTutorial : '';
},

publishDraft: async function (id: string, shouldPublish: boolean) {
  const { data } = await articleApiClient.put('/history/publishDraft', {
    postId: id,
    shouldPublish
  }) as { data: any };

  return data.data ? data.data.publishPost : '';
},
};