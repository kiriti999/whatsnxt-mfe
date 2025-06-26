import {
  CloudinaryAPI,
  ResourceType,
  UploadResponse,
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