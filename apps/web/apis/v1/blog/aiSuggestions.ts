import { articleApiClient, commonApiClient } from '@whatsnxt/core-util';

export const AISuggestions = {
    getSuggestionByAI: async (params: {
        question?: string;
        aiModel?: string;
        modelVersion?: string;
        messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    }) => {
        const response = await articleApiClient.post('/post/suggestionByAI', params);
        return response;
    },
    saveAIConfig: async (params: { apiKey: string; aiModel: string; modelVersion?: string }) => {
        const response = await articleApiClient.post('/post/saveKey', params);
        return response;
    },
    getAIConfig: async () => {
        const response = await commonApiClient.get('/ai/config');
        return response;
    },
};