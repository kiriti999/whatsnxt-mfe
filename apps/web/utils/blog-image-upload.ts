import {
  CloudinaryAPI,
  ResourceType,
  UploadResponse,
  DeleteResponse
} from '../../web/apis/v1/common/cloudinary';

export async function uploadToCloudinary(
  image: File | Blob,
  folderName: string = process.env.NEXT_PUBLIC_UPLOAD_CLOUDINARY_PRESET as string,
  onUploadProgress?: (progressEvent: any) => void,
  resource_type: ResourceType = 'auto',
  apiType: 'blog' | 'course' = 'blog'
): Promise<UploadResponse> {
  try {
    // Convert Blob to File if necessary
    let fileToUpload: File;
    if (image instanceof File) {
      fileToUpload = image;
    } else {
      // Convert Blob to File
      fileToUpload = new File([image], 'upload', { type: image.type || 'image/jpeg' });
    }

    // Use the appropriate API based on apiType parameter
    const uploadFunction = apiType === 'blog' ? CloudinaryAPI.blog.upload : CloudinaryAPI.course.upload;

    return await uploadFunction(
      fileToUpload,
      resource_type,
      folderName,
      onUploadProgress
    );
  } catch (error) {
    console.log('image-upload.js:: uploadToCloudinary:: error:', error);
    throw error;
  }
}

export async function uploadFormDataToCloudinary(
  image: string | Blob,
  folder?: string,
  apiType: 'blog' | 'course' = 'blog'
): Promise<UploadResponse> {
  try {
    let fileToUpload: File;

    if (typeof image === 'string') {
      // If it's a base64 string or URL, we need to convert it to a File
      if (image.startsWith('data:')) {
        // Handle base64 data URL
        const response = await fetch(image);
        const blob = await response.blob();
        fileToUpload = new File([blob], 'upload', { type: blob.type || 'image/jpeg' });
      } else {
        // Handle regular URL
        const response = await fetch(image);
        const blob = await response.blob();
        fileToUpload = new File([blob], 'upload', { type: blob.type || 'image/jpeg' });
      }
    } else {
      // Convert Blob to File
      fileToUpload = new File([image], 'upload', { type: image.type || 'image/jpeg' });
    }

    // Use the appropriate API based on apiType parameter
    const uploadFunction = apiType === 'blog' ? CloudinaryAPI.blog.upload : CloudinaryAPI.course.upload;

    return await uploadFunction(
      fileToUpload,
      'auto', // resource type
      folder || 'whatsnxt' // folder name
    );
  } catch (error) {
    console.log('image-upload.js:: uploadFormDataToCloudinary:: error:', error);
    throw error;
  }
}

export const deleteCloudinaryImage = async (
  public_id: string,
  resourceType?: ResourceType,
  apiType: 'blog' | 'course' = 'blog'
): Promise<DeleteResponse> => {
  try {
    // Use the appropriate API based on apiType parameter
    const deleteFunction = apiType === 'blog' ? CloudinaryAPI.blog.delete : CloudinaryAPI.course.delete;

    const deleteResult = await deleteFunction(public_id, resourceType);
    console.log(
      'image-upload.js:: deleteCloudinaryImage:: deleteResult:',
      deleteResult,
    );
    return deleteResult;
  } catch (error) {
    console.log('image-upload.js:: deleteCloudinaryImage:: error:', error);
    throw error;
  }
};

export const uploadMultipleToCloudinary = async (
  files: File[],
  folderName: string = 'whatsnxt',
  resource_type: ResourceType = 'auto',
  apiType: 'blog' | 'course' = 'blog',
  onUploadProgress?: (fileIndex: number, progressEvent: any) => void
): Promise<UploadResponse[]> => {
  try {
    const apiClient = apiType === 'blog' ?
      require('@whatsnxt/core-util').articleApiClient :
      require('@whatsnxt/core-util').courseApiClient;

    const endpoint = apiType === 'blog' ? '/cloudinary/upload-image' : '/cloudinary/upload';

    return await CloudinaryAPI.uploadMultiple(files, {
      apiClient,
      endpoint,
      resource_type,
      folderName,
      onUploadProgress
    });
  } catch (error) {
    console.log('uploadMultipleToCloudinary:: error:', error);
    throw error;
  }
};