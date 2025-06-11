import { bffApiClient } from '@whatsnxt/core-util';

export const ProfileAPI = {
  getProfile: async function (token) {
    const response = await bffApiClient.get('/common/profile', token);
    return response?.data;
  },
  getEditProfile: async function () {
    const response = await bffApiClient.patch('/profile/edit-profile', {});
    return response;
  },
  resetPasswordRequest: async function (payload) {
    const response = await bffApiClient.post('/profile/reset-password-request', payload);
    return response;
  },
  editPassword: async function (payload) {
    const response = await bffApiClient.patch('/profile/edit-password', payload);
    return response;
  },
  editProfile: async function (payload) {
    const response = await bffApiClient.patch('/profile/edit-profile', payload);
    return response;
  },
  editProfileInfo: async function (payload) {
    const response = await bffApiClient.patch('/profile/edit-profile-info', payload);
    return response;
  },
  setPassword: async function (payload) {
    const response = await bffApiClient.post(`/profile/reset-password/${payload.id}/${payload.token}`, { password: payload.password });
    return response;
  },
};