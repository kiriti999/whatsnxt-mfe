
import { commonApiClient } from '@whatsnxt/core-util';

export const AuthAPI = {

  login: async (payload: unknown) => {
    const response = await commonApiClient.post('/auth/login', payload)
    return response?.data;
  },

  otp: async (payload: unknown) => {
    const response = await commonApiClient.post('/auth/send-otp', payload);
    return response?.data;
  },

  createAccount: async (payload: unknown) => {
    const response = await commonApiClient.post('/auth/createAccount', payload);
    return response?.data;
  },

  logout: async () => {
    const response = await commonApiClient.post('/auth/logout', {});
    return response;
  },

  getUser: async () => {
    const response = await commonApiClient.get('/auth/user');
    return response?.data;
  }
};
