import { CloudinaryAPI } from '@/api/index';

export const deleteAssets = async (assets: any, accessToken: string) => {
    return await CloudinaryAPI.deleteMultipleAssets(assets, accessToken)
};

self.onmessage = async (event) => {
    const { assetsList, accessToken } = event.data;
    try {
        const results = await deleteAssets(assetsList, accessToken)
        self.postMessage({ status: 'success', results });
    } catch (error: any) {
        self.postMessage({ status: 'error', error: error.message });
    }
};