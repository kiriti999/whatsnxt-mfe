import { unifiedUploadWebWorker } from '../../../utils/worker/assetManager';

export const uploadImage = async (image, folder, addToLocalStorage, bffApiUrl) => {
    if (!image) {
        return { secure_url: null, asset: null };
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
            addToLocalStorage,
            bffApiUrl
        });

        // Clean up temporary URL
        URL.revokeObjectURL(tempUrl);

        if (!fileUploadResData) {
            return { secure_url: null, asset: null };
        }

        // Return only the new card image asset — callers replace the old one
        const asset = {
            public_id: fileUploadResData.public_id,
            resource_type: fileUploadResData.resource_type,
            url: fileUploadResData.url,
            secure_url: fileUploadResData.secure_url,
            format: fileUploadResData.format
        };

        return { secure_url: fileUploadResData.secure_url, asset };

    } catch (error) {
        console.error('Upload failed:', error);
        // Clean up temporary URL on error
        URL.revokeObjectURL(tempUrl);
        // Re-throw error for caller to handle
        throw error;
    }
};