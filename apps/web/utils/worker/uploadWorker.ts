import { CloudinaryAPI } from '../../api/v1/cloudinary';

const uploadApi = async (eventData) => {
    const { file, fileKeyName, folder, type } = eventData

    const payload = new FormData();
    payload.append(fileKeyName, file);
    payload.append('resourceType', type);
    if (folder) {
        payload.append('folder', folder);
    }
    const onUploadProgress = (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        self.postMessage({ status: 'progress', progress });
    }

    try {
        return await CloudinaryAPI.upload(payload, onUploadProgress)
    } catch (error) {
        return error
    }

}

self.onmessage = async (event) => {
    try {
        // upload resource with webworker
        const response = await uploadApi(event.data)
        self.postMessage({ status: 'success', response });
    } catch (error) {
        console.log(error)
        self.postMessage({ status: 'error', error: error.message });
    }
};
