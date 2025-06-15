import { bffApiClient } from '@whatsnxt/core-util';

export const CloudinaryAPI = {
    upload: async function (payload: unknown, onUploadProgress: any) {
        const response = await bffApiClient.post('/cloudinary/upload', payload, {
            onUploadProgress: onUploadProgress
        });
        return response.data;
    },
    uploadFormData: async function (formData: unknown) {
        const response = await bffApiClient.post('/cloudinary/upload', formData, {
            withCredentials: false
        });
        return response?.data || null;
    },
    deleteAsset: async function (id: any, resource_type: any) {
        const response = await bffApiClient.delete('/cloudinary/delete-asset', {
            public_id: id,
            resource_type
        });
        return response?.data || [];
    },
    deleteMultiAssets: async function (public_ids: any) {
        const response = await bffApiClient.delete('/cloudinary/delete-multiple-assets', public_ids);
        return response?.data || [];
    },
    delete: async function (id: string) {
        const response = await bffApiClient.delete(`/api/v1/cloudinary?deleteID=${id}`, null);
        console.log('CloudinaryAPI:: delete:: response: ', response?.data);
        return response?.data || [];
    },
};