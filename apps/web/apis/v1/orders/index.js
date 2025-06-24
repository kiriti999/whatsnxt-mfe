import { courseApiClient } from '@whatsnxt/core-util';

export const orderAPI = {
  createOrder: async function (payload) {
    const response = await courseApiClient.post('/orders', payload);
    return response;
  },
  updateOrder: async function (orderId, payload) {
    const response = await courseApiClient.patch(`/orders/${orderId}`, payload);
    return response;
  },
  getUserOrders: async function (userId) {
    const response = await courseApiClient.get(`/orders/user/${userId}`);
    return response;
  },
  getPaidOrderByCourseId: async function (userId, courseId) {
    const response = await courseApiClient.get(`/orders/${userId}/${courseId}`);
    return response;
  },
  verifyPayment: async function (orderId, payload) {
    const response = await courseApiClient.post(`/orders/${orderId}/verify`, payload);
    return response;
  },
  savePayment: async function (payload) {
    const response = await courseApiClient.post('/payment/save', payload);
    return response;
  },
};