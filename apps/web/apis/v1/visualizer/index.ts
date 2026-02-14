import { articleApiClient } from '@whatsnxt/core-util';
import type { GenerateDiagramPayload, SaveDiagramPayload } from '../../../components/Visualizer/types';

export const VisualizerAPI = {
    generateDiagram: async (payload: GenerateDiagramPayload) => {
        const { data } = await articleApiClient.post('/visualizer/generate', payload);
        return data;
    },

    regenerateDiagram: async (payload: GenerateDiagramPayload) => {
        const { data } = await articleApiClient.post('/visualizer/regenerate', payload);
        return data;
    },

    saveDiagram: async (payload: SaveDiagramPayload) => {
        const { data } = await articleApiClient.post('/visualizer/save', payload);
        return data;
    },

    getUserDiagrams: async (page = 1, limit = 10) => {
        const { data } = await articleApiClient.get(`/visualizer/list?page=${page}&limit=${limit}`);
        return data;
    },

    getDiagram: async (id: string) => {
        const { data } = await articleApiClient.get(`/visualizer/${id}`);
        return data;
    },

    updateDiagram: async (id: string, updates: Record<string, any>) => {
        const { data } = await articleApiClient.put(`/visualizer/${id}`, updates);
        return data;
    },

    deleteDiagram: async (id: string) => {
        const { data } = await articleApiClient.delete(`/visualizer/${id}`);
        return data;
    },

    getMeta: async () => {
        const { data } = await articleApiClient.get('/visualizer/meta');
        return data;
    },
};
