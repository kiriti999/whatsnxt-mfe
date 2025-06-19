
import { CloudinaryAPI } from '../api/v1/common/cloudinary';

// Types for better type safety
type ResourceType = 'image' | 'video' | 'raw' | 'auto';

// Local type definitions
interface UploadResponse {
  success: boolean;
  result?: any;
  error?: string;
  public_id: string;
  secure_url: string;
  url: string;
}

// Fixed getBase64 function - return the Promise
async function getBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Fixed getImageAsData function
export const getImageAsData = async (file: File): Promise<string> => {
  try {
    const base64Image = await getBase64(file);
    return base64Image;
  } catch (error) {
    throw new Error('image-upload:: getImageAsData:: unable to return image data: ' + error);
  }
};

// Fixed uploadToCloudinary function - using the correct CloudinaryAPI methods
export async function uploadToCloudinary(
  image: File | Blob,
  folder: string = 'whatsnxt',
  resource_type: ResourceType = 'auto',
  apiType: 'blog' | 'course' = 'blog'
): Promise<UploadResponse> {
  try {
    // Convert to File if it's a Blob
    let fileToUpload: File;
    if (image instanceof File) {
      fileToUpload = image;
    } else {
      fileToUpload = new File([image], 'upload', { type: image.type || 'image/jpeg' });
    }

    // Use the appropriate API based on apiType
    const uploadFunction = apiType === 'blog' ? CloudinaryAPI.blog.upload : CloudinaryAPI.course.upload;

    return await uploadFunction(
      fileToUpload,
      resource_type,
      folder
    );
  } catch (error) {
    console.error('uploadToCloudinary error:', error);
    throw error;
  }
}

// Alternative function that works with FormData if you need it
export async function uploadFormDataToCloudinary(
  formData: FormData,
  apiType: 'blog' | 'course' = 'blog'
): Promise<UploadResponse> {
  try {
    // Extract file from FormData
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'whatsnxt';
    const resource_type = (formData.get('resource_type') as ResourceType) || 'auto';

    if (!file) {
      throw new Error('No file found in FormData');
    }

    // Use the appropriate API
    const uploadFunction = apiType === 'blog' ? CloudinaryAPI.blog.upload : CloudinaryAPI.course.upload;

    return await uploadFunction(
      file,
      resource_type,
      folder
    );
  } catch (error) {
    console.error('uploadFormDataToCloudinary error:', error);
    throw error;
  }
}