// Version 1: REST API approach
const { bffApiClient } = require('@whatsnxt/core-util');

const AlgoliaAPI = {
    resetAlgolia: async function () {
        const response = await bffApiClient.post('/algolia/reset', {});
        return response.data;
    },
};

module.exports = { AlgoliaAPI };