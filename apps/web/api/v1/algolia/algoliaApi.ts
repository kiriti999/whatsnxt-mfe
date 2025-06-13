import { bffApiClient } from '@whatsnxt/core-util';

export const AlgoliaAPI = {
    resetAlgolia: async function () {
        const response = await bffApiClient.post('/algolia/reset', {});
        return response.data;
    },
};