import { courseApiClient } from '@whatsnxt/core-util';

export const CoursesEnrolledAPI = {
    createEnrolled: async function (body) {
        const response = await courseApiClient.post('/courses/enrolled', body);
        return response;
    },
    deleteEnrolled: async function (courseId) {
        const response = await courseApiClient.delete(`/courses/enrolled/${courseId}`);
        return response;
    },
    isEnrolled: async function (params) {
        const response = await courseApiClient.get('/courses/enrolled/isEnrolled', { params });
        return response;
    },
    getEnrolled: async function (token) {
        const response = await courseApiClient.get('/courses/enrolled', {
            headers: {
                'Authorization': token
            }
        });
        return response.data;
    },
    getEnrolledVideo: async function (token, params) {
        const response = await courseApiClient.get('/courses/enrolled/videos', {
            headers: {
                'Authorization': token
            },
            params: params
        });
        return response;
    },
    enrolledCount: async function (_id) {
        const response = await courseApiClient.get(`/courses/enrolled/${_id}`);
        return response;
    },
    updateCourseProgress: async function (payload) {
        const response = await courseApiClient.patch('/courses/enrolled', payload);
        return response;
    }
};