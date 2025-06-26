import { courseApiClient } from '@whatsnxt/core-util';

export const notificationAPI = {
    read: async function (payload) {
        const response = await courseApiClient.post('/courses/trainer/read-notifications', payload);
        return response;
    },
    delete: async function (payload) {
        const response = await courseApiClient.post('/courses/trainer/delete-notifications', payload);
        return response;
    },
};