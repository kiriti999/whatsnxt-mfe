import { courseApiClient } from '@whatsnxt/core-util';

export const AlgoliaAPI = {
    // Reset specific index by type
    resetIndex: async function (type) {
        if (!type) {
            throw new Error('Index type is required. Available types: blog, course, tutorial');
        }
        const response = await courseApiClient.delete(`/algolia/reset/${type}`);
        return response.data;
    },

    // Reset blog index specifically
    resetBlogIndex: async function () {
        const response = await courseApiClient.delete('/algolia/reset/blog');
        return response.data;
    },

    // Reset course index specifically
    resetCourseIndex: async function () {
        const response = await courseApiClient.delete('/algolia/reset/course');
        return response.data;
    },

    // Reset tutorial index specifically
    resetTutorialIndex: async function () {
        const response = await courseApiClient.delete('/algolia/reset/tutorial');
        return response.data;
    },

    // Reset all indexes at once
    resetAllIndexes: async function () {
        const response = await courseApiClient.delete('/algolia/reset/all');
        return response.data;
    },

    // Get service information
    getServiceInfo: async function () {
        const response = await courseApiClient.get('/algolia/info');
        return response.data;
    },

    // Legacy method for backward compatibility
    resetAlgolia: async function () {
        console.warn('resetAlgolia is deprecated. Use resetAllIndexes() instead.');
        return this.resetAllIndexes();
    }
};