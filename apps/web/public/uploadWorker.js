
// public/uploadWorker.js - Updated for BFF API
console.log('🔧 [Upload Worker] Worker script loaded');

// Add WebP conversion function inside worker
async function convertToWebP(file, options = {}) {
    const {
        quality = 0.50,           // WebP quality (0.1 to 1.0)
        maxWidth = 1920,          // Maximum width in pixels
        maxHeight = 1080,         // Maximum height in pixels
        maxFileSizeKB = 1200,      // Maximum file size in KB
        maintainAspectRatio = true // Keep original aspect ratio
    } = options;

    return new Promise((resolve, reject) => {
        // Check if it's an image and not already WebP
        if (!file.type.startsWith('image/') || file.type.includes('webp')) {
            resolve(file); // Return original if not an image or already WebP
            return;
        }

        const supportsOffscreenCanvas = typeof OffscreenCanvas !== 'undefined';

        if (!supportsOffscreenCanvas) {
            // Fallback: Send message to main thread to do conversion
            self.postMessage({
                status: 'convert_on_main_thread',
                file: file,
                options: options
            });
            return;
        }

        const canvas = new OffscreenCanvas(1, 1);
        const ctx = canvas.getContext('2d');

        // Create ImageBitmap from file
        createImageBitmap(file)
            .then(imageBitmap => {
                let { width, height } = imageBitmap;

                // Calculate new dimensions if resizing is needed
                if (width > maxWidth || height > maxHeight) {
                    if (maintainAspectRatio) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    } else {
                        width = Math.min(width, maxWidth);
                        height = Math.min(height, maxHeight);
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Draw the resized image
                ctx.drawImage(imageBitmap, 0, 0, width, height);

                // Try different quality levels to meet file size requirements
                const tryConversion = async (currentQuality) => {
                    try {
                        const blob = await canvas.convertToBlob({
                            type: 'image/webp',
                            quality: currentQuality
                        });

                        const fileSizeKB = blob.size / 1024;

                        // If file is too large and quality can be reduced further, try again
                        if (fileSizeKB > maxFileSizeKB && currentQuality > 0.1) {
                            const newQuality = Math.max(0.1, currentQuality - 0.1);
                            console.log(`🔄 File size ${fileSizeKB.toFixed(1)}KB exceeds ${maxFileSizeKB}KB, reducing quality to ${newQuality}`);
                            return tryConversion(newQuality);
                        }

                        const webpFile = new File([blob],
                            file.name.replace(/\.[^/.]+$/, '.webp'),
                            { type: 'image/webp' }
                        );

                        // Log compression stats
                        const originalSizeKB = file.size / 1024;
                        const compressionRatio = ((originalSizeKB - fileSizeKB) / originalSizeKB * 100).toFixed(1);

                        // console.log(`✅ WebP conversion complete:`);
                        // console.log(`   Original: ${originalSizeKB.toFixed(1)}KB (${imageBitmap.width}x${imageBitmap.height})`);
                        // console.log(`   Converted: ${fileSizeKB.toFixed(1)}KB (${width}x${height})`);
                        // console.log(`   Compression: ${compressionRatio}% reduction`);
                        // console.log(`   Quality used: ${currentQuality}`);

                        resolve(webpFile);
                    } catch (error) {
                        reject(error);
                    }
                };

                // Start conversion with initial quality
                tryConversion(quality);
            })
            .catch(reject);
    });
}

self.onmessage = async (event) => {
    console.log('🔧 [Upload Worker] Received message:', event.data);
    let { file, fileKeyName, folder, resource_type, bffApiUrl } = event.data;

    try {
        if (!file) {
            throw new Error('No file provided for upload');
        }

        // Convert to WebP if it's an image
        if (file.type.startsWith('image/')) {
            // console.log('🔄 [Upload Worker] Converting to WebP...');
            self.postMessage({ status: 'progress', progress: 5 });

            try {
                const originalSize = file.size;
                file = await convertToWebP(file, 0.85);
                const newSize = file.size;
                const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
                // console.log(`✅ [Upload Worker] WebP conversion complete. Size reduced by ${savings}%`);
            } catch (conversionError) {
                console.warn('⚠️ [Upload Worker] WebP conversion failed, using original:', conversionError);
                // Continue with original file
            }
        }

        // console.log('🔧 [Upload Worker] Starting upload:', file.name);

        // Send initial progress
        self.postMessage({ status: 'progress', progress: 0 });

        const formData = new FormData();
        formData.append(fileKeyName || 'file', file);
        formData.append('resource_type', resource_type);
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
                // console.log(`🔧 [Upload Worker] Progress: ${progress}%`);
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