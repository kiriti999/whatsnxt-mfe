import { bffApiClient } from '@whatsnxt/core-util';

export const CloudinaryAPI = {
    upload: async function (payload, onUploadProgress) {
        const response = await bffApiClient.post('/cloudinary/upload', payload, {
            onUploadProgress: onUploadProgress
        });
        return response.data;
    },
    uploadFormData: async function (formData) {
        const response = await bffApiClient.post('/cloudinary/upload', formData, {
            withCredentials: false
        });
        return response?.data || null;
    },
    deleteAsset: async function (id, resource_type) {
        const response = await bffApiClient.delete('/cloudinary/delete-asset', {
            public_id: id,
            resource_type
        });
        return response?.data || [];
    },
    deleteMultiAssets: async function (public_ids) {
        const response = await bffApiClient.delete('/cloudinary/delete-multiple-assets', public_ids);
        return response?.data || [];
    },
    delete: async function (id) {
        const response = await bffApiClient.delete(`/api/v1/cloudinary?deleteID=${id}`, null, {
            withCredentials: false
        });
        console.log('CloudinaryAPI:: delete:: response: ', response?.data);
        return response?.data || [];
    },
};