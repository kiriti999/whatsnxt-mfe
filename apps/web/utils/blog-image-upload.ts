import { CloudinaryAPI } from '../api/v1/cloudinary';

export async function uploadToCloudinary(image, folderName = process.env.NEXT_PUBLIC_UPLOAD_CLOUDINARY_PRESET) {
  try {
    let formData = new FormData();
    formData.append(
      'api_key',
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string,
    );
    formData.append('file', image);
    formData.append('folder', folderName);
    formData.append('upload_preset', folderName);
    formData.append('timeout', '120000');
    return await CloudinaryAPI.upload(formData);
  } catch (error) {
    console.log('image-upload.js:: uploadToCloudinary:: error:', error);
  }
}

export async function uploadFormDataToCloudinary(image, folder?: string) {
  const formData = new FormData();
  formData.append('file', image);
  formData.append('upload_preset', folder);
  formData.append('folder', folder); // Add the folder field
  return await CloudinaryAPI.uploadFormData(formData);
}

export const deleteCloudinaryImage = async (payload) => {
  const deleteResult = await CloudinaryAPI.delete(payload.public_id);
  console.log(
    'image-upload.js:: deleteCloudinaryImage:: deleteResult:',
    deleteResult,
  );
  return deleteResult;
};
