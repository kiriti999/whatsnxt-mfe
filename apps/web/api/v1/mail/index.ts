import { courseApiClient } from '@whatsnxt/core-util';

export const mailAPI = {
    sendCoursePurchaseMail: async function (payload) {
        const response = await courseApiClient.post('/mail/sendCoursePurchaseMail', payload);
        return response;
    },
    sendContactUsMail: async function (payload) {
        const response = await courseApiClient.post('/mail/contactUsMail', payload);
        return response;
    },
    sendTrainerContactedMail: async function (payload) {
        const response = await courseApiClient.post('/mail/sendTrainerContactedMail', payload);
        return response;
    },
    sendTeacherApplyMail: async function (payload) {
        const response = await courseApiClient.post('/mail/sendTeacherApplyMail', payload);
        return response;
    },
    sendCourseReviewMail: async function (payload) {
        const response = await courseApiClient.post('/mail/sendCourseReviewMail', payload);
        return response;
    },
    sendContactDetailsRefundMail: async function (payload) {
        const response = await courseApiClient.post('/mail/sendContactDetailsRefundMail', payload);
        return response;
    },
    sendCourseRefundMail: async function (payload) {
        const response = await courseApiClient.post('/mail/sendCourseRefundMail', payload);
        return response;
    }
};