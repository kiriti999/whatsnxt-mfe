import { bffApiClient } from '@whatsnxt/core-util';

export const CommentAPI = {
  getLessonComments: async function ({ limit, offset, lessonId, parentId = null }) {
    const paramsString = `limit=${limit}&offset=${offset}&lessonId=${lessonId}`;
    const searchParams = new URLSearchParams(paramsString);
    if (parentId) {
      searchParams.set('parentId', parentId);
    }
    const strSearchParams = searchParams.toString();

    const response = await bffApiClient.get(`/comment?${strSearchParams}`);
    return response.data;
  },
  create: async function (payload) {
    const response = await bffApiClient.post('/comment', payload);
    return response.data;
  },
  updateComment: async function ({ commentId, content }) {
    const response = await bffApiClient.patch(`/comment/${commentId}/edit`, { content });
    return response.data;
  },
  deleteComment: async function ({ commentId }) {
    const response = await bffApiClient.delete(`/comment/${commentId}`);
    return response;
  },
  toggleLike: async function ({ id, userId }) {
    const response = await bffApiClient.post(`/comment/${id}/toggleLike`, { userId });
    return response;
  },
  toggleDislike: async function ({ id, userId }) {
    const response = await bffApiClient.post(`/comment/${id}/toggleDislike`, { userId });
    return response;
  },
  reportComment: async function ({ id, userId }) {
    const response = await bffApiClient.patch(`/comment/${id}/flag`, { userId });
    return response;
  }
};