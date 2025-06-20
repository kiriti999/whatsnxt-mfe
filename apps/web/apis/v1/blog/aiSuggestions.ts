import { blogApiClient } from '@whatsnxt/core-util';

export const AISuggestions = {
    getSuggestionByChatGpt: async (question: unknown) => {
        const response = await blogApiClient.post('/posts/suggestionByChatGpt', question)
        return response;
    },
};