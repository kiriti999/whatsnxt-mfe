import { courseApiClient } from '@whatsnxt/core-util';

export const ProfileAPI = {
  getProfile: async function (token) {
    console.log(' token:', token)
    const response = await courseApiClient.get('/common/profile', token);
    return response;
  },
  getEditProfile: async function () {
    const response = await courseApiClient.patch('/common/profile/edit-profile', {});
    return response;
  },
  resetPasswordRequest: async function (payload) {
    const response = await courseApiClient.post('/common/profile/reset-password-request', payload);
    return response;
  },
  editPassword: async function (payload) {
    const response = await courseApiClient.patch('/common/profile/edit-password', payload);
    return response;
  },
  editProfile: async function (payload) {
    const response = await courseApiClient.patch('/common/profile/edit-profile', payload);
    return response;
  },
  editProfileInfo: async function (payload) {
    const response = await courseApiClient.patch('/common/profile/edit-profile-info', payload);
    return response;
  },
  setPassword: async function (payload) {
    const response = await courseApiClient.post(`/common/profile/reset-password/${payload.id}/${payload.token}`, { password: payload.password });
    return response;
  },
};