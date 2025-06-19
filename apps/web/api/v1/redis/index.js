import { courseApiClient } from '@whatsnxt/core-util';

export const CacheAPI = {
    invalidate: async function () {
        const response = await courseApiClient.get('/redis-cache/invalidate-all');
        return response.data;
    }
};