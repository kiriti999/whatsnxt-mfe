import { articleApiClient } from '@whatsnxt/core-util';

export const AISuggestions = {
    getSuggestionByAI: async (params: { question: string; aiModel?: string; modelVersion?: string }) => {
        const response = await articleApiClient.post('/post/suggestionByAI', params);
        return response;
    },
    saveAIConfig: async (params: { apiKey: string; aiModel: string; modelVersion?: string }) => {
        const response = await articleApiClient.post('/post/saveKey', params);
        return response;
    },
};