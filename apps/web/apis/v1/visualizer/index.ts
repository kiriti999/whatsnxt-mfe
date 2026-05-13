import { articleApiClient } from '@whatsnxt/core-util';
import type { AnimationManifest } from '@whatsnxt/types';
import type { GenerateDiagramPayload, SaveDiagramPayload } from '../../../components/Visualizer/types';

/** BFF `{ success: true, data: T }` → `T`. Throws on `success: false`. */
function unwrapVisualizerSuccessData<T>(body: unknown, context: string): T {
	if (!body || typeof body !== 'object') {
		throw new Error(`Invalid ${context} response`);
	}
	const o = body as { success?: boolean; data?: T; error?: string };
	if (o.success === true && o.data !== undefined) {
		return o.data;
	}
	if (o.success === false && typeof o.error === 'string') {
		throw new Error(o.error);
	}
	return body as T;
}

export type DiagramAnimationManifestResult = {
	manifest: AnimationManifest;
	aiModel: string;
};

export type DiagramRenderAnimationJobCreateResult = {
	jobId: string;
	status: string;
};

export type DiagramRenderAnimationJobStatusResult = {
	jobId: string;
	status: string;
	mp4Url?: string | null;
	gifUrl?: string | null;
	error?: string | null;
	createdAt?: string;
	updatedAt?: string;
};

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

    generateAnimationManifest: async (payload: {
        diagramData: Record<string, unknown>;
        prompt: string;
        aiModel?: string;
        modelVersion?: string;
    }): Promise<DiagramAnimationManifestResult> => {
        const { data } = await articleApiClient.post('/visualizer/animation-manifest', payload);
        return unwrapVisualizerSuccessData<DiagramAnimationManifestResult>(data, 'animation-manifest');
    },

    createRenderAnimationJob: async (payload: {
        diagramData: Record<string, unknown>;
        svgContent: string;
        animationManifest: AnimationManifest;
        format: 'gif' | 'mp4' | 'both';
        gifFps?: number;
    }): Promise<DiagramRenderAnimationJobCreateResult> => {
        const { data } = await articleApiClient.post('/visualizer/render-animation', payload);
        return unwrapVisualizerSuccessData<DiagramRenderAnimationJobCreateResult>(data, 'render-animation');
    },

    getRenderAnimationJob: async (jobId: string): Promise<DiagramRenderAnimationJobStatusResult> => {
        const { data } = await articleApiClient.get(`/visualizer/render-animation/${jobId}`);
        return unwrapVisualizerSuccessData<DiagramRenderAnimationJobStatusResult>(data, 'render-animation job');
    },

    saveAnimationBundle: async (payload: {
        manifest: AnimationManifest;
        svgContent: string;
        diagramData: Record<string, unknown>;
    }): Promise<{ message: string; path: string; files: string[] }> => {
        const { data } = await articleApiClient.post('/visualizer/save-animation-bundle', payload);
        return unwrapVisualizerSuccessData<{ message: string; path: string; files: string[] }>(
            data,
            'save-animation-bundle',
        );
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
