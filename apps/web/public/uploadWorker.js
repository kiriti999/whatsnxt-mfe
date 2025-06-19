
// public/uploadWorker.js - Updated for BFF API
console.log('🔧 [Upload Worker] Worker script loaded');

self.onmessage = async (event) => {
    console.log('🔧 [Upload Worker] Received message:', event.data);
    const { file, fileKeyName, folder, type, bffApiUrl } = event.data;

    try {
        if (!file) {
            throw new Error('No file provided for upload');
        }

        console.log('🔧 [Upload Worker] Starting upload:', file.name);

        // Send initial progress
        self.postMessage({ status: 'progress', progress: 0 });

        const formData = new FormData();
        formData.append(fileKeyName || 'file', file);
        formData.append('resourceType', type);
        if (folder) {
            formData.append('folder', folder);
        }

        // Get the BFF API base URL
        const BFF_API_BASE = bffApiUrl;

        // Use XMLHttpRequest for progress tracking
        const xhr = new XMLHttpRequest();

        // 3. Event handlers are triggered after xhr.send
        // These lines just REGISTER the event handlers
        // No actual events are fired yet - just setting up listeners
        xhr.upload.addEventListener('progress', (progressEvent) => {
            if (progressEvent.lengthComputable) {
                const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                console.log(`🔧 [Upload Worker] Progress: ${progress}%`);
                self.postMessage({ status: 'progress', progress });
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    console.log('🔧 [Upload Worker] Upload successful:', response);
                    self.postMessage({ status: 'success', response });
                } catch (parseError) {
                    console.error('🔧 [Upload Worker] Parse error:', parseError);
                    self.postMessage({
                        status: 'error',
                        error: 'Failed to parse upload response'
                    });
                }
            } else {
                console.error(`🔧 [Upload Worker] Upload failed: ${xhr.status}`);
                self.postMessage({
                    status: 'error',
                    error: `Upload failed: ${xhr.status} ${xhr.statusText}`
                });
            }
        });

        xhr.addEventListener('error', () => {
            console.error('🔧 [Upload Worker] Network error');
            self.postMessage({
                status: 'error',
                error: 'Network error during upload'
            });
        });

        xhr.addEventListener('abort', () => {
            console.error('🔧 [Upload Worker] Upload aborted');
            self.postMessage({
                status: 'error',
                error: 'Upload was aborted'
            });
        });

        // 1. Configure the request with URL
        xhr.open('POST', `${BFF_API_BASE}/cloudinary/upload`);

        // Add any authentication headers your BFF requires
        // xhr.setRequestHeader('Authorization', 'Bearer ' + token);

        // 2. Send the request
        xhr.send(formData);

    } catch (error) {
        console.error('🔧 [Upload Worker] Error:', error);
        self.postMessage({
            status: 'error',
            error: error.message || 'Unknown upload error'
        });
    }
};