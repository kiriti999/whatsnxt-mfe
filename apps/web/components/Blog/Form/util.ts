import { unifiedUploadWebWorker } from '../../../utils/worker/assetManager';

export const uploadImage = async (image, cloudinaryAssets, folder, addToLocalStorage) => {
    if (!image) {
        return { imageUrl: null, updatedAssets: cloudinaryAssets };
    }

    console.log(`uploadImage:: Uploading via worker...`);

    // Create temporary URL for immediate preview if needed
    const tempUrl = URL.createObjectURL(image);

    try {
        // Use web worker upload instead of direct API call
        const fileUploadResData = await unifiedUploadWebWorker({
            file: image,
            folder: folder,
            resource_type: 'image',
            setProgress: (progressUpdate) => {
                // console.log(`Upload progress: ${progressUpdate.progress}%`);
            },
            rejectOnError: true, // Set to true if you want to handle errors explicitly
            addToLocalStorage
        });

        let secure_url = null;
        let updatedAssets = [...cloudinaryAssets];

        if (fileUploadResData) {
            secure_url = fileUploadResData.secure_url;
            updatedAssets.push({
                public_id: fileUploadResData.public_id,
                resource_type: fileUploadResData.resource_type,
                url: fileUploadResData.url,
                secure_url: secure_url,
                format: fileUploadResData.format
            });
        }

        // Clean up temporary URL
        URL.revokeObjectURL(tempUrl);

        return { secure_url, updatedAssets };

    } catch (error) {
        console.error('Upload failed:', error);
        // Clean up temporary URL on error
        URL.revokeObjectURL(tempUrl);
        // Re-throw error for caller to handle
        throw error;
    }
};