// Version 1: REST API approach
const { articleApiClient } = require('@whatsnxt/core-util');

const AlgoliaAPI = {
    resetAlgolia: async function () {
        const response = await articleApiClient.post('/algolia/reset', {});
        return response.data;
    },
};

module.exports = { AlgoliaAPI };