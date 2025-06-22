import { articleApiClient } from '@whatsnxt/core-util';

export const AISuggestions = {
    getSuggestionByChatGpt: async (question: unknown) => {
        const response = await articleApiClient.post('/posts/suggestionByChatGpt', question)
        return response;
    },
};