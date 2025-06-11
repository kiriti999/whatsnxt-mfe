import xior from 'xior';
import { blogApiClient } from '@whatsnxt/core-util';

// Get the Cloudinary upload URL based on the resource type
export const getUploadUrl = (type: 'image' | 'raw' | 'video'): string => {
  if (type === 'image') return process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL!;
  if (type === 'video') return process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_URL!;
  if (type === 'raw') return process.env.NEXT_PUBLIC_CLOUDINARY_FILE_UPLOAD_URL!;
  return process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL!;
};

// Fallback for progress tracking with XMLHttpRequest
const uploadWithProgress = (formData: FormData, onUploadProgress: (progressEvent: any) => void, type: 'image' | 'raw' | 'video'): Promise<any> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const uploadUrl = getUploadUrl(type);

    xhr.open('POST', uploadUrl, true);

    // Attach progress event
    xhr.upload.onprogress = onUploadProgress;

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(xhr.statusText);
      }
    };

    xhr.onerror = () => {
      reject(xhr.statusText);
    };

    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send(formData);
  });
};

export const CloudinaryAPI = {
  upload: async function (
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void,
    type: 'image' | 'raw' | 'video' = 'image'
  ) {
    try {
      if (onUploadProgress) {
        // Use XMLHttpRequest for uploads with progress tracking
        return await uploadWithProgress(formData, onUploadProgress, type);
      } else {
        // Use Xior for uploads without progress tracking
        const response = await xior.request({
          url: getUploadUrl(type),
          method: 'POST',
          data: formData,
          withCredentials: false,
          timeout: 60000,
        });
        return response?.data || [];
      }
    } catch (error) {
      console.log('Upload error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      });
      throw error;
    }
  },

  uploadFormData: async function (formData: any, type: 'image' | 'raw' | 'video' = 'image') {
    console.log('getUploadUrl(type) ', getUploadUrl(type))
    const response = await blogApiClient.post(getUploadUrl(type), formData, {
      withCredentials: false,
    });
    return response?.data || null;
  },

  // Deleting single asset
  delete: async function (id: string) {
    const { data } = await blogApiClient.delete('/cloudinary/deleteAsset', { deleteID: id });
    return data.data ? data.data.deleteImage : false;
  },

  // Deleting multiple assets
  deleteMultipleAssets: async function (assets: { type: string, id: string }[], accessToken: string) {
    const { data } = await blogApiClient.delete('/cloudinary/deleteMultipleAssets', {
      assets,
      accessToken
    });
    return data.data ? data.data.deleteMultiAssets : false;
  },

  uploadFormImage: async function (image: File, resourceType: string, folderName = 'whatsnxt-blog') {
    try {
      console.log('uploadFormImage ...')
      const formData = new FormData();
      formData.append("file", image, image.name);
      formData.append('resource_type', resourceType);
      formData.append('folder_name', folderName);

      const { data } = await blogApiClient.post('/cloudinary/upload-image', formData);
      console.log(' uploadFormImage:: response:', data);
      return data;
    } catch (error) {
      console.log('uploadFormImage:: error:', error);
      throw error;
    }
  },
};