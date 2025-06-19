import xior from 'xior';
import { blogApiClient, courseApiClient } from '@whatsnxt/core-util';

// Types for better type safety
export type ResourceType = 'image' | 'video' | 'raw' | 'auto';
export type UploadProgressCallback = (progressEvent: any) => void;

export interface Asset {
    publicId: string;
    resource_type: ResourceType;
}

export interface UploadResponse {
    success: boolean;
    result?: any;
    error?: string;
    secure_url: string;
    public_id: string;
    resource_type: string;
    url: string;
    format: any;
}

export interface DeleteResponse {
    success: boolean;
    result?: any;
    message?: string;
}

// Get the Cloudinary upload URL based on the resource type
export const getUploadUrl = (resource_type: ResourceType): string => {
    const urlMap = {
        image: process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL!,
        video: process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_URL!,
        raw: process.env.NEXT_PUBLIC_CLOUDINARY_FILE_UPLOAD_URL!,
        auto: process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL! // Default to image URL
    };

    return urlMap[resource_type] || urlMap.image;
};

// Upload with progress tracking using XMLHttpRequest to your API endpoint
const uploadWithProgressToAPI = (
    formData: FormData,
    onUploadProgress: UploadProgressCallback,
    apiClient: any,
    endpoint: string
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Get the base URL from your API client
        const baseURL = apiClient.defaults?.baseURL || apiClient.baseURL || '';
        const fullUrl = baseURL + endpoint;

        xhr.open('POST', fullUrl, true);

        // Attach progress event
        xhr.upload.onprogress = onUploadProgress;

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch (error) {
                    reject(new Error('Invalid JSON response'));
                }
            } else {
                reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error(`Network error: ${xhr.statusText}`));
        };

        xhr.ontimeout = () => {
            reject(new Error('Upload timeout'));
        };

        xhr.timeout = 60000; // 60 seconds timeout
        xhr.setRequestHeader('Accept', 'application/json');

        // Copy any authorization headers from your API client
        if (apiClient.defaults?.headers?.common?.Authorization) {
            xhr.setRequestHeader('Authorization', apiClient.defaults.headers.common.Authorization);
        }
        if (apiClient.defaults?.headers?.Authorization) {
            xhr.setRequestHeader('Authorization', apiClient.defaults.headers.Authorization);
        }

        xhr.send(formData);
    });
};

// Direct Cloudinary upload with progress tracking (requires upload preset)
const uploadWithProgress = (
    formData: FormData,
    onUploadProgress: UploadProgressCallback,
    resource_type: ResourceType,
    apiClient?: any
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const uploadUrl = getUploadUrl(resource_type);

        xhr.open('POST', uploadUrl, true);

        // Attach progress event
        xhr.upload.onprogress = onUploadProgress;

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch (error) {
                    reject(new Error('Invalid JSON response'));
                }
            } else {
                reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error(`Network error: ${xhr.statusText}`));
        };

        xhr.ontimeout = () => {
            reject(new Error('Upload timeout'));
        };

        xhr.timeout = 60000; // 60 seconds timeout
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send(formData);
    });
};

// Unified upload function for both blog and course
const createUploadFunction = (apiClient: any, endpoint: string, defaultPreset?: string) => {
    return async function (
        file: File,
        resource_type: ResourceType = 'auto',
        folderName: string = 'whatsnxt',
        onUploadProgress?: UploadProgressCallback,
        uploadPreset?: string
    ): Promise<UploadResponse> {
        try {
            const formData = new FormData();
            formData.append("file", file, file.name);

            let response;

            // Use preset priority: parameter > default > environment variable
            const preset = uploadPreset || defaultPreset || process.env.NEXT_PUBLIC_UPLOAD_CLOUDINARY_PRESET;
            if (!preset) {
                throw new Error('Upload preset is required. Provide uploadPreset parameter, set default preset, or set NEXT_PUBLIC_UPLOAD_CLOUDINARY_PRESET environment variable.');
            }

            // Add required Cloudinary parameters
            formData.append('upload_preset', preset);
            formData.append('folder', folderName);

            // Add API key if available
            if (process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY) {
                formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
            }

            console.log('Uploading directly to Cloudinary with preset:', preset);
            console.log('Folder:', folderName);
            console.log('Resource type:', resource_type);

            if (onUploadProgress) {
                response = await uploadWithProgress(formData, onUploadProgress, resource_type);
            } else {
                const uploadUrl = getUploadUrl(resource_type);
                console.log('Direct upload URL:', uploadUrl);
                const result = await xior.request({
                    url: uploadUrl,
                    method: 'POST',
                    data: formData,
                    withCredentials: false,
                    timeout: 60000,
                });
                response = result.data;
            }

            console.log('Upload response:', response);
            return response;
        } catch (error: any) {
            console.error('Upload error:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data
            });
            throw error;
        }
    };
};

// Unified delete single asset function
const createDeleteFunction = (apiClient: any, endpoint: string = '/cloudinary/delete-asset') => {
    return async function (publicId: string, resource_type?: ResourceType): Promise<DeleteResponse> {
        try {
            const payload = resource_type
                ? { public_id: publicId, resource_type: resource_type, deleteID: publicId }
                : { public_id: publicId, deleteID: publicId };

            const response = await apiClient.delete(endpoint, payload);
            return response.data;
        } catch (error: any) {
            console.error('Delete error:', error);
            throw error;
        }
    };
};

// Unified delete multiple assets function
const createDeleteMultipleFunction = (apiClient: any, endpoint: string = '/cloudinary/delete-multiple-assets') => {
    return async function (assets: Asset[], accessToken?: string): Promise<DeleteResponse> {
        try {
            if (!assets || !Array.isArray(assets) || assets.length === 0) {
                throw new Error('Assets array is required and must not be empty');
            }

            const payload = accessToken
                ? { assets: assets, accessToken }
                : { assets: assets };

            const response = await apiClient.delete(endpoint, payload);
            return response.data;
        } catch (error: any) {
            console.error('Delete multiple assets error:', error);
            throw error;
        }
    };
};

export const CloudinaryAPI = {
    // #region BLOG API
    blog: {
        upload: createUploadFunction(blogApiClient, '/cloudinary/upload-image', 'whatsnxt-blog'),

        // Direct upload to Cloudinary with preset
        uploadDirect: createUploadFunction(blogApiClient, '/cloudinary/upload-image', 'whatsnxt-blog'),

        delete: createDeleteFunction(blogApiClient, '/cloudinary/deleteAsset'),

        deleteMultiple: createDeleteMultipleFunction(blogApiClient, '/cloudinary/deleteMultipleAssets'),

        // Legacy method for backward compatibility
        uploadFormImage: async function (
            image: File,
            resource_type: ResourceType = 'auto',
            folderName: string = 'whatsnxt-blog'
        ): Promise<UploadResponse> {
            console.warn('uploadFormImage is deprecated, use upload() instead');
            return this.upload(image, resource_type, folderName);
        }
    },
    // #endregion BLOG

    // #region COURSE API
    course: {
        upload: createUploadFunction(courseApiClient, '/cloudinary/upload', 'whatsnxt-course'),

        // Direct upload to Cloudinary with preset
        uploadDirect: createUploadFunction(courseApiClient, '/cloudinary/upload', 'whatsnxt-course'),

        delete: createDeleteFunction(courseApiClient),

        deleteMultiple: createDeleteMultipleFunction(courseApiClient),

        // Legacy upload with progress (for backward compatibility)
        uploadWithProgress: async function (
            file: File,
            resource_type: ResourceType = 'auto',
            folderName: string = 'whatsnxt',
            onUploadProgress: UploadProgressCallback
        ): Promise<UploadResponse> {
            return this.upload(file, resource_type, folderName, onUploadProgress);
        }
    },
    // #endregion COURSE

    // #region SHARED/UTILITY METHODS

    // Direct upload to Cloudinary (bypasses your API endpoints) - requires upload preset
    upload: async function (
        formData: FormData,
        onUploadProgress?: UploadProgressCallback,
        resource_type: ResourceType = 'image'
    ): Promise<any> {
        try {
            if (onUploadProgress) {
                // Use XMLHttpRequest for uploads with progress tracking DIRECTLY to Cloudinary
                return await uploadWithProgress(formData, onUploadProgress, resource_type);
            } else {
                // Use Xior for uploads without progress tracking DIRECTLY to Cloudinary
                const response = await xior.request({
                    url: getUploadUrl(resource_type),
                    method: 'POST',
                    data: formData,
                    withCredentials: false,
                    timeout: 60000,
                });
                return response?.data || [];
            }
        } catch (error: any) {
            console.log('Upload error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data
            });
            throw error;
        }
    },

    // Upload FormData directly to Cloudinary
    uploadFormData: async function (formData: FormData, resource_type: ResourceType = 'image'): Promise<any> {
        try {
            // Ensure preset is included
            if (!formData.has('upload_preset')) {
                const preset = process.env.NEXT_PUBLIC_UPLOAD_CLOUDINARY_PRESET;
                if (preset) {
                    formData.append('upload_preset', preset);
                }
            }

            // Add API key if not present and available
            if (!formData.has('api_key') && process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY) {
                formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
            }

            const uploadUrl = getUploadUrl(resource_type);
            console.log('FormData upload URL:', uploadUrl);

            const response = await xior.request({
                url: uploadUrl,
                method: 'POST',
                data: formData,
                withCredentials: false,
                timeout: 60000,
            });
            return response?.data || null;
        } catch (error: any) {
            console.error('FormData upload error:', error);
            throw error;
        }
    },

    // Direct upload to Cloudinary with upload preset
    uploadDirect: async function (
        file: File,
        options: {
            uploadPreset: string;
            folder?: string;
            resource_type?: ResourceType;
            onUploadProgress?: UploadProgressCallback;
        }
    ): Promise<any> {
        const { uploadPreset, folder, resource_type = 'auto', onUploadProgress } = options;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        if (folder) {
            formData.append('folder', folder);
        }

        return this.upload(formData, onUploadProgress, resource_type);
    },

    // Generic upload that can work with any API client
    uploadFile: async function (
        file: File,
        options: {
            apiClient: any;
            endpoint: string;
            resource_type?: ResourceType;
            folderName?: string;
            onUploadProgress?: UploadProgressCallback;
        }
    ): Promise<UploadResponse> {
        const {
            apiClient,
            endpoint,
            resource_type = 'auto',
            folderName = 'whatsnxt',
            onUploadProgress
        } = options;

        const uploadFn = createUploadFunction(apiClient, endpoint);
        return uploadFn(file, resource_type, folderName, onUploadProgress);
    },

    // Batch upload multiple files
    uploadMultiple: async function (
        files: File[],
        options: {
            apiClient: any;
            endpoint: string;
            resource_type?: ResourceType;
            folderName?: string;
            onUploadProgress?: (fileIndex: number, progressEvent: any) => void;
        }
    ): Promise<UploadResponse[]> {
        const {
            apiClient,
            endpoint,
            resource_type = 'auto',
            folderName = 'whatsnxt',
            onUploadProgress
        } = options;

        const uploadPromises = files.map((file, index) => {
            const progressCallback = onUploadProgress
                ? (progressEvent: any) => onUploadProgress(index, progressEvent)
                : undefined;

            return this.uploadFile(file, {
                apiClient,
                endpoint,
                resource_type,
                folderName,
                onUploadProgress: progressCallback
            });
        });

        return Promise.all(uploadPromises);
    },

    // Legacy delete method for backward compatibility
    delete: async function (id: string): Promise<any> {
        console.warn('CloudinaryAPI.delete is deprecated, use CloudinaryAPI.blog.delete or CloudinaryAPI.course.delete instead');
        return this.blog.delete(id);
    },

    // Legacy delete multiple method for backward compatibility
    deleteMultipleAssets: async function (assets: { resource_type: string, id: string }[], accessToken: string): Promise<any> {
        console.warn('CloudinaryAPI.deleteMultipleAssets is deprecated, use CloudinaryAPI.blog.deleteMultiple or CloudinaryAPI.course.deleteMultiple instead');
        const formattedAssets = assets.map(asset => ({ publicId: asset.id, resource_type: asset.resource_type as ResourceType }));
        return this.blog.deleteMultiple(formattedAssets, accessToken);
    }
    // #endregion SHARED
};

// Export individual functions for tree-shaking
export const {
    blog: blogCloudinaryAPI,
    course: courseCloudinaryAPI,
    uploadFile,
    uploadMultiple
} = CloudinaryAPI;