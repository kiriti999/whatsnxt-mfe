import { bffApiClient } from '@whatsnxt/core-util';

export const CacheAPI = {
    invalidate: async function () {
        const response = await bffApiClient.get('/redis-cache/invalidate-all');
        return response.data;
    }
};