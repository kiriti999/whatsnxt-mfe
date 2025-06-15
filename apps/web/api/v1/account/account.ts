import { bffApiClient } from '@whatsnxt/core-util';

export const AccountAPI = {
  new: async function (payload: unknown) {
    const response = await bffApiClient.post('/account/new', payload);
    return response.data;
  },
  update: async function (payload: unknown) {
    const response = await bffApiClient.put('/account/new', payload);
    return response.data;
  },
  get: async function () {
    const response = await bffApiClient.get('/account');
    return response.data;
  },
  approve: async function (payload: unknown) {
    const response = await bffApiClient.post('/apply/approve', payload);
    return response.data;
  },
  decline: async function (payload: unknown) {
    const response = await bffApiClient.post('/apply/decline', payload);
    return response.data;
  },
  pending: async function (payload: unknown, offset = 0, limit = 5) {
    const response = await bffApiClient.post(`/apply/pending?limit=${limit}&offset=${offset}`, payload);
    return response.data;
  },
}