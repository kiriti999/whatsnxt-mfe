
// public/uploadWorker.js - Updated for BFF API
console.log('🔧 [Upload Worker] Worker script loaded');

// Add WebP conversion function inside worker
async function convertToWebP(file, options = {}) {
    const {
        quality = 0.30,           // Initial WebP quality (0.1 to 1.0)
        maxWidth = 1920,          // Maximum width in pixels
        maxHeight = 1080,         // Maximum height in pixels
        targetFileSizeKB = 10,    // Target file size in KB
        maintainAspectRatio = true // Keep original aspect ratio
    } = options;

    return new Promise((resolve, reject) => {
        // Check if file is already 10KB or smaller
        const currentFileSizeKB = file.size / 1024;
        if (currentFileSizeKB <= targetFileSizeKB) {
            console.log(`✅ File is already ${currentFileSizeKB.toFixed(1)}KB, no compression needed`);
            resolve(file);
            return;
        }

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
                let currentWidth = width;
                let currentHeight = height;

                // Calculate initial dimensions if resizing is needed
                if (width > maxWidth || height > maxHeight) {
                    if (maintainAspectRatio) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        currentWidth = Math.round(width * ratio);
                        currentHeight = Math.round(height * ratio);
                    } else {
                        currentWidth = Math.min(width, maxWidth);
                        currentHeight = Math.min(height, maxHeight);
                    }
                }

                // Aggressive compression function to reach target size
                const compressToTarget = async (currentQuality = quality, scaleFactor = 1.0, attempts = 0) => {
                    const maxAttempts = 15; // Prevent infinite loops

                    if (attempts >= maxAttempts) {
                        console.log(`⚠️ Reached maximum attempts, returning best result`);
                        const blob = await canvas.convertToBlob({
                            type: 'image/webp',
                            quality: 0.1 // Minimum quality as fallback
                        });

                        const webpFile = new File([blob],
                            file.name.replace(/\.[^/.]+$/, '.webp'),
                            { type: 'image/webp' }
                        );
                        resolve(webpFile);
                        return;
                    }

                    try {
                        // Calculate current canvas dimensions
                        const canvasWidth = Math.round(currentWidth * scaleFactor);
                        const canvasHeight = Math.round(currentHeight * scaleFactor);

                        // Ensure minimum dimensions
                        if (canvasWidth < 50 || canvasHeight < 50) {
                            console.log(`⚠️ Image too small, using minimum dimensions`);
                            canvas.width = Math.max(50, canvasWidth);
                            canvas.height = Math.max(50, canvasHeight);
                        } else {
                            canvas.width = canvasWidth;
                            canvas.height = canvasHeight;
                        }

                        // Clear and draw the resized image
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

                        const blob = await canvas.convertToBlob({
                            type: 'image/webp',
                            quality: currentQuality
                        });

                        const fileSizeKB = blob.size / 1024;
                        console.log(`📏 Attempt ${attempts + 1}: ${fileSizeKB.toFixed(1)}KB (Quality: ${currentQuality.toFixed(2)}, Scale: ${scaleFactor.toFixed(2)}, Dimensions: ${canvas.width}x${canvas.height})`);

                        // Check if we're close enough to target (within 5% tolerance)
                        const tolerance = targetFileSizeKB * 0.05;
                        if (Math.abs(fileSizeKB - targetFileSizeKB) <= tolerance) {
                            console.log(`✅ Target achieved: ${fileSizeKB.toFixed(1)}KB`);
                            const webpFile = new File([blob],
                                file.name.replace(/\.[^/.]+$/, '.webp'),
                                { type: 'image/webp' }
                            );
                            resolve(webpFile);
                            return;
                        }

                        // If file is too large, reduce quality or scale
                        if (fileSizeKB > targetFileSizeKB) {
                            let newQuality = currentQuality;
                            let newScaleFactor = scaleFactor;

                            // If quality is still high, reduce it first
                            if (currentQuality > 0.15) {
                                newQuality = Math.max(0.1, currentQuality - 0.1);
                            } else {
                                // If quality is already low, reduce dimensions
                                newScaleFactor = Math.max(0.3, scaleFactor - 0.1);
                            }

                            return compressToTarget(newQuality, newScaleFactor, attempts + 1);
                        } else {
                            // File is smaller than target, we can accept this result
                            console.log(`✅ Target achieved: ${fileSizeKB.toFixed(1)}KB (under target)`);
                            const webpFile = new File([blob],
                                file.name.replace(/\.[^/.]+$/, '.webp'),
                                { type: 'image/webp' }
                            );
                            resolve(webpFile);
                            return;
                        }

                    } catch (error) {
                        reject(error);
                    }
                };

                // Start compression process
                console.log(`🎯 Starting compression from ${currentFileSizeKB.toFixed(1)}KB to ${targetFileSizeKB}KB`);
                compressToTarget();
            })
            .catch(reject);
    });
}

self.onmessage = async (event) => {
    // console.log('🔧 [Upload Worker] Received message:', event.data);
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
                    console.log('🔧 [Upload Worker] Upload successful:', JSON.stringify(response));
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
        xhr.open('POST', `${bffApiUrl}/upload`);

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