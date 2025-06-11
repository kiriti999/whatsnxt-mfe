
import { authApiClient } from '@whatsnxt/core-util';

export const AuthAPI = {

  login: async (payload) => {
    const response = await authApiClient.post('/auth/login', payload)
    return response?.data;
  },

  otp: async (payload) => {
    const response = await authApiClient.post('/auth/send-otp', payload);
    return response?.data;
  },

  createAccount: async (payload) => {
    const response = await authApiClient.post('/auth/createAccount', payload);
    return response?.data;
  },

  logout: async () => {
    const response = await authApiClient.get('/auth/logout');
    return response;
  },

  getUser: async () => {
    const response = await authApiClient.get('/auth/user');
    return response?.data;
  }
};
