import { articleApiClient } from '@whatsnxt/core-util';

export const AISuggestions = {
    getSuggestionByChatGpt: async (question: unknown) => {
        const response = await articleApiClient.post('/post/suggestionByChatGpt', question)
        return response;
    },
};