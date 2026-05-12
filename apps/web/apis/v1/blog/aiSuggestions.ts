import { articleApiClient, commonApiClient } from '@whatsnxt/core-util';

/** Reference image for AI content generation (raw base64, no data: prefix). */
export type AiSuggestionContextImage = {
    mimeType: string;
    dataBase64: string;
};

export const AISuggestions = {
    getSuggestionByAI: async (params: {
        question?: string;
        aiModel?: string;
        modelVersion?: string;
        messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
        diagramContext?: {
            includeDiagram?: boolean;
            diagramMode?: string;
            diagramType?: string;
        };
        /** Optional images sent as multimodal context (e.g. diagrams, screenshots). */
        contextImages?: AiSuggestionContextImage[];
    }) => {
        const response = await articleApiClient.post('/post/suggestionByAI', params);
        return response;
    },
    generateTutorialImage: async (params: {
        title: string;
        publicId?: string;
        imageMode?: 'auto' | 'manual';
        visualType?: string;
        contentKind?: 'blog' | 'tutorial';
    }) => {
        const response = await articleApiClient.post('/post/generateTutorialImage', params);
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