import { bffApiClient } from '@whatsnxt/core-util';

export const razorPaymentAPI = {
    getPaymentDetailsById: async function (paymentId) {
        const response = await bffApiClient.get(`/payment/razorpay/${paymentId}`);
        return response;
    },
    capturePayment: async function (paymentId, amount) {
        const response = await bffApiClient.post(`/payment/razorpay/${paymentId}/capture`, { amount });
        return response;
    },
    refundPayment: async function (paymentId, amount) {
        const response = await bffApiClient.post(`/payment/razorpay/${paymentId}/refund`, { amount });
        return response;
    },
};