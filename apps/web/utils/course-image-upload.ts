
import { CloudinaryAPI } from '../apis/v1/common/cloudinary';

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
// Helper function to convert base64 data URL to Blob
const base64ToBlob = (base64Data: string): Blob => {
  const byteCharacters = atob(base64Data.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const mimeType = base64Data.split(',')[0].split(':')[1].split(';')[0];

  return new Blob([byteArray], { type: mimeType });
};

const handleProfilePhotoUpload = async ({ courseImageUrl, imageAttributes, setImageUploading }) => {
  let secure_url = '';
  setImageUploading(true);

  if (courseImageUrl) {
    const base64Data = await getImageAsData(courseImageUrl);

    // Convert base64 string to Blob
    const imageBlob = base64ToBlob(base64Data);

    const cloudinary = await uploadToCloudinary(imageBlob);
    secure_url = cloudinary?.secure_url;
    imageAttributes = { public_id: cloudinary?.public_id };
  }

  setImageUploading(false);
  return secure_url;
};

// Alternative approach: Update uploadToCloudinary to handle strings
export async function uploadToCloudinary(
  image: File | Blob | string,
  folder: string = 'whatsnxt',
  resource_type: ResourceType = 'auto',
  apiType: 'blog' | 'course' = 'blog'
): Promise<UploadResponse> {
  try {
    let fileToUpload: File;

    if (image instanceof File) {
      fileToUpload = image;
    } else if (image instanceof Blob) {
      fileToUpload = new File([image], 'upload', { type: image.type || 'image/jpeg' });
    } else if (typeof image === 'string') {
      // Handle base64 data URL or regular URL
      let blob: Blob;

      if (image.startsWith('data:')) {
        // Convert base64 data URL to blob
        const response = await fetch(image);
        blob = await response.blob();
      } else {
        // Handle regular URL
        const response = await fetch(image);
        blob = await response.blob();
      }

      fileToUpload = new File([blob], 'upload', { type: blob.type || 'image/jpeg' });
    } else {
      throw new Error('Invalid image type. Expected File, Blob, or string.');
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