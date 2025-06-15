import { CloudinaryAPI } from '../../api/v1/blog/cloudinaryApi';

export const uploadApi = async (eventData: any) => {
  const { file, fileKeyName, folder, type } = eventData;
  const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_CLOUDINARY_PRESET;
  const payload = new FormData();

  payload.append(fileKeyName, file);
  payload.append('upload_preset', `${uploadPreset}`);
  payload.append('resourceType', type);
  payload.append('folder', `${folder ? `${uploadPreset}/${folder}` : `${uploadPreset}`}`);

  // Upload progress count callback 
  const onUploadProgress = (progressEvent: any) => {
    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    self.postMessage({ status: 'progress', progress });
  };

  try {
    // Use the progress tracking or fall back based on the client condition
    if (process.env.AXIOS_CLIENT) {
      return await CloudinaryAPI.upload(payload, onUploadProgress, type);
    } else {
      return await CloudinaryAPI.upload(payload, null, type);
    }
  } catch (error) {
    return error;
  }
};

self.onmessage = async (event) => {
  try {
    // Upload resource with Web Worker
    const response = await uploadApi(event.data);
    self.postMessage({ status: 'success', response });
  } catch (error: any) {
    console.log(error);
    self.postMessage({ status: 'error', error: error.message });
  }
};
