import { bffApiClient } from '@whatsnxt/core-util';

export const orderAPI = {
  createOrder: async function (payload) {
    console.log('createOrder:: payload:', payload);
    const response = await bffApiClient.post('/orders', payload);
    return response;
  },
  updateOrder: async function (orderId, payload) {
    const response = await bffApiClient.patch(`/orders/${orderId}`, payload);
    return response;
  },
  getUserOrders: async function (userId) {
    const response = await bffApiClient.get(`/orders/user/${userId}`);
    return response;
  },
  getPaidOrderByCourseId: async function (userId, courseId) {
    const response = await bffApiClient.get(`/orders/${userId}/${courseId}`);
    return response;
  },
  verifyPayment: async function (orderId, payload) {
    const response = await bffApiClient.post(`/orders/${orderId}/verify`, payload);
    return response;
  },
  savePayment: async function (payload) {
    const response = await bffApiClient.post('/payment/save', payload);
    return response;
  },
};