import { bffApiClient } from '@whatsnxt/core-util';

export const trainerContactedPaymentAPI = {
  createOrder: async function (payload) {
    const response = await bffApiClient.post('/trainer-contacted-payment', payload);
    return response;
  },
  updateOrder: async function (orderId, payload) {
    const response = await bffApiClient.patch(`/trainer-contacted-payment/${orderId}`, payload);
    return response;
  },
  getPaymentById: async function (orderId) {
    const response = await bffApiClient.get(`/trainer-contacted-payment/${orderId}`);
    return response;
  },
  getUserPayments: async function (userId) {
    const response = await bffApiClient.get(`/trainer-contacted-payment/user/${userId}`);
    return response;
  },
  getUserPayment: async function (trainerId, userId) {
    const response = await bffApiClient.get(`/trainer-contacted-payment/user/${trainerId}/${userId}`);
    return response;
  },
  userAlreadyPurchased: async function (trainerId, userId) {
    const response = await bffApiClient.get(`/trainer-contacted-payment/user-already-purchased/${trainerId}/${userId}`);
    return response;
  },
  verifyPayment: async function (orderId, payload) {
    const response = await bffApiClient.post(`/trainer-contacted-payment/${orderId}/verify`, payload);
    return response;
  },
};