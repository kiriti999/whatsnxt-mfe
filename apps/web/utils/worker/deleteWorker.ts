import { CloudinaryAPI } from '../../api/v1/cloudinary';

export const deleteAssets = async (public_ids) => {
    return await CloudinaryAPI.deleteMultiAssets({ public_ids })
};

self.onmessage = async (event) => {
    const { assetsList } = event.data;
    try {
        const results = await deleteAssets(assetsList)

        self.postMessage({ status: 'success', results });
    } catch (error) {
        self.postMessage({ status: 'error', error: error.message });
    }
};