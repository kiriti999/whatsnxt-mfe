// Version 1: REST API approach
const { blogApiClient } = require('@whatsnxt/core-util');

const AlgoliaAPI = {
    resetAlgolia: async function () {
        const response = await blogApiClient.post('/algolia/reset', {});
        return response.data;
    },
};

module.exports = { AlgoliaAPI };