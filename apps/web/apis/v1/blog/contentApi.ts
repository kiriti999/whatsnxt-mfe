import { articleApiClient } from '@whatsnxt/core-util';
import { ContentType } from '../../../types/form';


export const ContentAPI = {

  getPosts: async function (start: number, limit: number, type: any) {
    const { data } = await articleApiClient.get(`/post/getPosts?start=${start}&limit=${limit}&type=${type}`,)
    return data ? data.posts : [];
  },

  getTutorials: async function (start: number, limit: number, type: any) {
    const { data } = await articleApiClient.get(`/tutorial?start=${start}&limit=${limit}&type=${type}`,)
    return data?.data ? data.data.tutorials : [];
  },

  getMyDrafts: async function (pageParam: number, limit: number, search?: string) {
    const queryParams = new URLSearchParams({
      start: pageParam.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });

    const { data } = await articleApiClient.get(`/post/my-drafts?${queryParams}`);
    return data ? data.data.posts : { posts: [], totalRecords: 0 };
  },

  getMyPublishedPosts: async function (pageParam: number, limit: number, type: ContentType, search?: string) {
    const queryParams = new URLSearchParams({
      start: pageParam.toString(),
      limit: limit.toString(),
      type,
      ...(search && { search })
    });

    const { data } = await articleApiClient.get(`/post/my-published?${queryParams}`);
    return data ? data.data.posts : { posts: [], totalRecords: 0 };
  },

  getMyAllContent: async function (pageParam: number, limit: number, type: ContentType, search?: string) {
    const queryParams = new URLSearchParams({
      start: pageParam.toString(),
      limit: limit.toString(),
      type,
      ...(search && { search })
    });

    const { data } = await articleApiClient.get(`/post/my-all?${queryParams}`);
    return data ? data.data.posts : { posts: [], totalRecords: 0 };
  },

  getPostsById: async function (id: string) {
    const { data } = await articleApiClient.get(`/post/getPostById/${id}`);
    return data ? data : {};
  },

  getPostsByCategory: async function (categoryName: string) {
    const { data } = await articleApiClient.get(`/post/getPostsByCategory?categoryName=${encodeURIComponent(categoryName)}`)
    return data ? data : [];
  },

  getComments: async function (payload: any) {
    const queryParams = new URLSearchParams({
      id: payload.blogId,
      contentId: payload.contentId,
      offset: payload.offset,
      limit: payload.limit,
      ...(payload.parentId && { parentId: payload.parentId })
    });

    const { data } = await articleApiClient.get(`/comment/getComments?${queryParams}`);
    return data ? data : [];
  },

  postComment: async function (payload: any) {
    console.log('postComment:: payload:', payload)
    const { data } = await articleApiClient.post(`/comment/createComment`, {
      contentId: payload.contentId,
      content: payload.content,
      email: payload.email,
      parentId: payload.parentId,
    });
    return data ? data : {};
  },

  editComment: async function (payload: any) {
    console.log(' payload:', payload)
    const { data } = await articleApiClient.put(`/comment/editComment`, {
      contentId: payload.contentId,
      content: payload.comment,
      id: payload.commentId,
      email: payload.email
    });
    return data ? data : {};
  },

  deleteComment: async function (payload: any) {
    const queryParams = new URLSearchParams({
      id: payload.id,
      contentId: payload.contentId,
      email: payload.email
    });

    const { data } = await articleApiClient.delete(`/comment/deleteComment?${queryParams}`);
    return data ? data : {};
  },

  likeComment: async function (payload: {
    commentId: string,
    email: string
  }) {
    const { data } = await articleApiClient.post(`/comment/toggleLike`, {
      id: payload.commentId,
      email: payload.email
    });
    return data ? data : {};
  },

  dislikeComment: async function (payload: {
    commentId: string,
    email: string
  }) {
    const { data } = await articleApiClient.post(`/comment/toggleDislike`, {
      id: payload.commentId,
      email: payload.email
    });
    return data ? data : {};
  },

  flagComment: async function (payload: any) {
    const { data } = await articleApiClient.post(`/comment/flagComment`, {
      id: payload.id,
      email: payload.email
    });
    return data;
  }
};