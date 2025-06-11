import { manageWorker } from '../../../../utils/worker/manageWorker';
import { notifications } from '@mantine/notifications';

interface UploadResponse {
    secure_url: string;
    duration: number;
    public_id: string;
    resource_type: string;
}

export const uploadAssetWebWorker = async ({
    file,
    lectureId,
    type,
    setProgress,
}: {
    file: File;
    lectureId: string;
    type: string;
    setProgress: (progress: { fileName: string; progress: number; timestamp: number }) => void;
}): Promise<UploadResponse | null> => {
    // Create a new worker with the upload worker script
    const worker = new Worker(new URL('../../../../utils/worker/uploadWorker', import.meta.url));

    try {
        const response = await manageWorker(worker, {
            file,
            fileKeyName: 'file',
            folder: lectureId,
            type,
        }, setProgress) as UploadResponse;

        if (response) {
            console.log('🚀 ~ uploadAssetWebWorker ~ response:', response);
            return {
                secure_url: response.secure_url,
                duration: response.duration,
                public_id: response.public_id,
                resource_type: response.resource_type,
            };
        }
    } catch (error) {
        notifications.show({
            position: 'bottom-left',
            title: 'Upload Failed',
            message: 'Resource failed to upload',
            color: 'red',
        });
        console.error('Upload error:', error);
        return null; // Explicitly return null on failure
    }
};

export const deleteAssetWebWorker = async ({ assetsList }) => {
    const worker = new Worker(new URL('../../../../utils/worker/deleteWorker', import.meta.url));

    try {
        const response: any = await manageWorker(worker, { assetsList });

        // Check if deletion was successful based on presence of timestamp
        if (response && response.timestamp) {
            console.log('🚀 ~ deleteAssetWebWorker ~ All assets deleted successfully:', response);
            return { success: true };
        } else {
            console.warn('🚀 ~ deleteAssetWebWorker ~ Deletion failed:', response);
            return { success: false };
        }
    } catch (error) {
        console.error('Deletion error:', error);
        return { success: false, error };
    }
};