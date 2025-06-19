import { courseApiClient } from '@whatsnxt/core-util';

export const CourseFeedbackAPI = {
    getReviews: async function (courseId, page = 1, limit = 10) {
        const response = await courseApiClient.get(`/courses/feedback/${courseId}/reviews`, { params: { page, limit } });
        return response;
    },
    getUserReviewOnCourse: async function (courseId, userId) {
        const paramsString = `userId=${userId}&courseId=${courseId}`;
        const searchParams = new URLSearchParams(paramsString);
        const strSearchParams = searchParams.toString();

        const response = await courseApiClient.get(`/courses/feedback/course?${strSearchParams}`);
        return response.data;
    },
    addReview: async function (courseId, payload) {
        const response = await courseApiClient.post(`/courses/feedback/${courseId}/reviews`, payload);
        return response;
    },
    updateComment: async function ({ content, commentId }) {
        const response = await courseApiClient.patch(`/courses/feedback/${commentId}/edit`, { content });
        return response.data;
    },
    deleteComment: async function ({ commentId }) {
        const response = await courseApiClient.delete(`/courses/feedback/${commentId}`);
        return response;
    },
    toggleLike: async function ({ id, userId }) {
        const response = await courseApiClient.post(`/courses/feedback/${id}/toggleLike`, { userId });
        return response;
    },
    toggleDislike: async function ({ id, userId }) {
        const response = await courseApiClient.post(`/courses/feedback/${id}/toggleDislike`, { userId });
        return response;
    },
    flagRating: async function ({ id, userId }) {
        const response = await courseApiClient.patch(`/courses/feedback/${id}/flag`, { userId });
        return response;
    },
    addRating: async function (courseId, payload) {
        const response = await courseApiClient.post(`/courses/feedback/${courseId}/rating`, payload);
        return response;
    },
    getUserRating: async function (courseId, userId) {
        const response = await courseApiClient.get(`/courses/feedback/${courseId}/rating`, { params: { userId } });
        return response.data;
    },
    updateRating: async function (courseId, payload) {
        const response = await courseApiClient.patch(`/courses/feedback/${courseId}/rating`, payload);
        return response.data;
    },
    deleteRating: async function (courseId) {
        const response = await courseApiClient.delete(`/courses/course/${courseId}/rating`);
        return response.data;
    },
};