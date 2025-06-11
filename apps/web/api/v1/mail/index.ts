import { bffApiClient } from '@whatsnxt/core-util';

export const mailAPI = {
    sendCoursePurchaseMail: async function (payload) {
        const response = await bffApiClient.post('/mail/sendCoursePurchaseMail', payload);
        return response;
    },
    sendContactUsMail: async function (payload) {
        const response = await bffApiClient.post('/mail/contactUsMail', payload);
        return response;
    },
    sendTrainerContactedMail: async function (payload) {
        const response = await bffApiClient.post('/mail/sendTrainerContactedMail', payload);
        return response;
    },
    sendTeacherApplyMail: async function (payload) {
        const response = await bffApiClient.post('/mail/sendTeacherApplyMail', payload);
        return response;
    },
    sendCourseReviewMail: async function (payload) {
        const response = await bffApiClient.post('/mail/sendCourseReviewMail', payload);
        return response;
    },
    sendContactDetailsRefundMail: async function (payload) {
        const response = await bffApiClient.post('/mail/sendContactDetailsRefundMail', payload);
        return response;
    },
    sendCourseRefundMail: async function (payload) {
        const response = await bffApiClient.post('/mail/sendCourseRefundMail', payload);
        return response;
    }
};