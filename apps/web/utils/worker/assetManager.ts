// Convenience wrapper functions for backward compatibility
// export const // Browser Process
// ├── Main Thread (UI Thread)
// │   ├── JavaScript execution
// │   ├── DOM manipulation
// │   ├── Event handling
// │   └── Rendering
// │
// └── Worker Thread(s) 
//     ├── Background JavaScript execution
//     ├── No DOM access
//     ├── Network requests (fetch, XMLHttpRequest)
//     └── Heavy computations


import { notifications } from '@mantine/notifications';
import { removeTempImageFromEditor, replaceImageLinksOnContentPreview } from '../../components/RichTextEditor/common/EditorUtils';
import { UnifiedUploadOptions, UploadResponse, UnifiedDeleteOptions, DeleteAssetResult, WorkerResponse } from './types';


export const unifiedUploadWebWorker = async (options: UnifiedUploadOptions): Promise<UploadResponse | null> => {
    const {
        file,
        folder,
        resource_type,
        setProgress,
        editor,
        tempUrl,
        rejectOnError = false,
        addToLocalStorage = true
    } = options;

    console.log('🚀 [Turbopack] Starting upload for:', file.name);

    return new Promise((resolve, reject) => {
        let worker: Worker;
        let timeoutId: NodeJS.Timeout;
        const timestamp = Date.now();

        const cleanup = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            if (worker) {
                worker.terminate();
            }
        };

        const handleError = (error: any, message: string) => {
            console.error('❌ [Turbopack]', message, error);
            cleanup();

            // Only handle image-specific cleanup for images when editor is available
            if (editor && tempUrl) {
                removeTempImageFromEditor({ editor, tempUrl });
            }

            notifications.show({
                position: 'bottom-right',
                title: 'Upload Failed',
                message: typeof error === 'string' ? error : message,
                color: 'red',
            });

            if (rejectOnError) {
                reject(error);
            } else {
                resolve(null);
            }
        };

        try {
            worker = new Worker(/* turbopackIgnore: true */ "/uploadWorker.js");
            console.log('✅ [Turbopack] Upload worker created for:', file.name);
        } catch (error) {
            handleError(error, 'Failed to initialize upload worker');
            return;
        }

        worker.onmessage = (event) => {
            const { status, response, error, progress } = event.data;
            console.log('📨 [Turbopack] Upload worker message:', { status, progress });

            switch (status) {
                case 'progress':
                    if (setProgress) {
                        setProgress({
                            fileName: file.name,
                            progress: progress || 0,
                            timestamp: timestamp
                        });
                    }
                    break;

                case 'success':
                    console.log('✅ [Turbopack] Upload completed:', response);

                    if (setProgress) {
                        setProgress({
                            fileName: file.name,
                            progress: 100,
                            timestamp: timestamp,
                            isCompleted: true
                        });
                    }

                    cleanup();

                    if (response && response.secure_url && response.public_id) {
                        const result: UploadResponse = {
                            url: response.url,
                            format: response.format,
                            secure_url: response.secure_url,
                            public_id: response.public_id,
                            timestamp: (response.timestamp || timestamp).toString(),
                            resource_type: response.resource_type || resource_type,
                            duration: response.duration || 0,
                        };

                        // Dynamic localStorage handling based on resource resource_type
                        if (result.public_id && result.resource_type && addToLocalStorage) {
                            import('./localStorageHandler')
                                .then(({ addAssetOnLocalStorage }) => {
                                    const success = addAssetOnLocalStorage(result.public_id, result.resource_type);
                                    if (!success) {
                                        console.warn('Failed to save asset to localStorage');
                                    }
                                })
                                .catch((error) => {
                                    console.error('Error importing localStorage utilities:', error);
                                });
                        }

                        // Handle conditional logic based on Cloudinary resource_type
                        if (result.resource_type === 'image' && editor && tempUrl && addToLocalStorage) {
                            // Only handle image replacement for actual images
                            replaceImageLinksOnContentPreview({
                                setProgress,
                                timestamp: result.timestamp,
                                file,
                                tempUrl,
                                imageUrl: result.secure_url,
                                editor
                            }).then(() => {
                                resolve(result);
                            }).catch(rejectOnError ? reject : () => resolve(null));
                        } else {
                            // For video and raw files, just resolve with the result
                            resolve(result);
                        }
                    } else {
                        handleError('Invalid response structure', 'Invalid response from upload service');
                    }
                    break;

                case 'error':
                    handleError(error, 'Upload failed');
                    break;

                default:
                    console.warn('🤔 [Turbopack] Unknown worker status:', status);
            }
        };

        worker.onerror = (error) => {
            handleError(error, 'Worker error occurred during upload');
        };

        worker.onmessageerror = (error) => {
            handleError(error, 'Data serialization error');
        };

        try {
            worker.postMessage({
                file,
                fileKeyName: 'file',
                folder,
                resource_type,
                bffApiUrl: process.env.NEXT_PUBLIC_BFF_HOST_COMMON_API
            });

            console.log('📤 [Turbopack] Upload task sent to worker');
        } catch (error) {
            handleError(error, 'Failed to start upload process');
        }

        // Timeout protection
        const timeoutDuration = Math.max(60000, file.size / 1024 / 1024 * 10000);
        timeoutId = setTimeout(() => {
            handleError('Upload timeout', `Upload of ${file.name} timed out`);
        }, timeoutDuration);
    });
};

export const unifiedDeleteWebWorker = async (options: UnifiedDeleteOptions): Promise<DeleteAssetResult> => {
    const {
        assetsList,
        clearLocalStorage = false,
        returnDetailedResult = true
    } = options;

    console.log('🚀 [Turbopack] Unified delete worker :: assetsList:', assetsList);

    return new Promise((resolve) => {
        let worker: Worker | null = null;
        let isResolved = false;
        let timeoutId: NodeJS.Timeout;

        const cleanup = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            if (worker) {
                worker.terminate();
                worker = null;
            }
        };

        const resolveOnce = (result: DeleteAssetResult) => {
            if (!isResolved) {
                isResolved = true;
                cleanup();
                resolve(result);
            }
        };

        try {
            // Check if Worker is available (browser environment)
            if (typeof Worker === 'undefined') {
                console.error('❌ [Turbopack] Web Workers not supported');
                const errorResult = returnDetailedResult
                    ? { success: false, error: 'Web Workers not supported in this environment' }
                    : { success: false }; // Changed from 'false' to object
                resolveOnce(errorResult);
                return;
            }

            worker = new Worker(/* turbopackIgnore: true */ "/deleteWorker.js");
            console.log('✅ [Turbopack] Delete worker created successfully');

        } catch (error) {
            console.error('❌ [Turbopack] Failed to create delete worker:', error);
            const errorResult = returnDetailedResult
                ? { success: false, error: 'Failed to create worker' }
                : { success: false }; // Changed from 'false' to object
            resolveOnce(errorResult);
            return;
        }

        // Set up worker event handlers
        worker.onmessage = (event) => {
            const { status, results, error }: WorkerResponse = event.data;
            console.log('📨 [Turbopack] Delete worker response:', { status, results, error });

            if (status === 'success') {
                // Handle localStorage clearing if requested
                if (clearLocalStorage) {
                    import('./localStorageHandler')
                        .then(({ removeAllAssetFromLocalStorage }) => {
                            removeAllAssetFromLocalStorage();
                            const successResult = returnDetailedResult
                                ? { success: true, results }
                                : { success: true }; // Changed from 'true' to object
                            resolveOnce(successResult);
                        })
                        .catch(() => {
                            // Still resolve as success since main delete succeeded
                            const successResult = returnDetailedResult
                                ? { success: true, results }
                                : { success: true }; // Changed from 'true' to object
                            resolveOnce(successResult);
                        });
                } else {
                    const successResult = returnDetailedResult
                        ? { success: true, results }
                        : { success: true }; // Changed from 'true' to object
                    resolveOnce(successResult);
                }
            } else {
                const errorResult = returnDetailedResult
                    ? { success: false, error: error || 'Unknown worker error' }
                    : { success: false }; // Changed from 'false' to object
                resolveOnce(errorResult);
            }
        };

        worker.onerror = (error) => {
            console.error('❌ [Turbopack] Delete worker error:', error);
            const errorResult = returnDetailedResult
                ? { success: false, error: error.message || 'Worker execution error' }
                : { success: false }; // Changed from 'false' to object
            resolveOnce(errorResult);
        };

        worker.onmessageerror = (error) => {
            console.error('❌ [Turbopack] Delete worker message error:', error);
            const errorResult = returnDetailedResult
                ? { success: false, error: 'Message serialization error' }
                : { success: false }; // Changed from 'false' to object
            resolveOnce(errorResult);
        };

        // Send message to worker
        try {
            const bffApiUrl = process.env.NEXT_PUBLIC_BFF_HOST_COMMON_API;
            if (!bffApiUrl) {
                console.error('❌ [Turbopack] BFF API URL not configured');
                const errorResult = returnDetailedResult
                    ? { success: false, error: 'BFF API URL not configured' }
                    : { success: false }; // Changed from 'false' to object
                resolveOnce(errorResult);
                return;
            }

            worker.postMessage({ assetsList, bffApiUrl });
            console.log('📤 [Turbopack] Delete task sent to worker');
        } catch (error) {
            console.error('❌ [Turbopack] Failed to send delete task:', error);
            const errorResult = returnDetailedResult
                ? { success: false, error: 'Failed to send message to worker' }
                : { success: false }; // Changed from 'false' to object
            resolveOnce(errorResult);
            return;
        }

        // Set timeout
        timeoutId = setTimeout(() => {
            console.error('⏰ [Turbopack] Delete worker timeout');
            const errorResult = returnDetailedResult
                ? { success: false, error: 'Worker timeout after 30 seconds' }
                : { success: false }; // Changed from 'false' to object
            resolveOnce(errorResult);
        }, 30000);
    });
};