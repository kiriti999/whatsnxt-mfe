import { CloudinaryAPI } from '../api/v1/cloudinary';

async function getBase64(file, cb) {
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => cb(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export const getImageAsData = (file) =>
  new Promise((resolve, reject) => {
    getBase64(file, (base64Image) => {
      resolve(base64Image);
      reject(
        'image-upload:: getImageAsData:: promise reject: unable to return image data',
      );
    });
  });

export async function uploadToCloudinary(image, folder?: string) {
  const formData = new FormData();
  formData.append('file', image);
  formData.append('folder', folder); // Add the folder field
  return await CloudinaryAPI.uploadFormData(formData);
}