import { notifications } from '@mantine/notifications';

interface UploadResponse {
    secure_url: string;
    duration: number;
    public_id: string;
    resource_type: string;
}

interface ProgressUpdate {
    fileName: string;
    progress: number;
    timestamp: number;
    isCompleted?: boolean;
}

export const uploadAssetWebWorker = async ({
    file,
    lectureId,
    type,
    setProgress,
}: {
    file: File;
    lectureId: string;
    type: string;
    setProgress: (progress: ProgressUpdate) => void;
}): Promise<UploadResponse | null> => {
    console.log('🚀 [Turbopack] Starting upload for:', file.name);

    return new Promise((resolve, reject) => {
        let worker: Worker;
        let timeoutId: NodeJS.Timeout;
        const timestamp = Date.now();

        // Cleanup function to clear timeout and terminate worker
        const cleanup = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            if (worker) {
                worker.terminate();
            }
        };

        try {
            // FIXED: Use different file extension to avoid worker loader
            worker = new Worker(/* turbopackIgnore: true */ "/uploadWorker.js");

            console.log('✅ [Turbopack] Upload worker created for:', file.name);

        } catch (error) {
            console.error('❌ [Turbopack] Failed to create upload worker:', error);
            notifications.show({
                position: 'bottom-right',
                title: 'Upload Failed',
                message: 'Failed to initialize upload worker',
                color: 'red',
            });
            resolve(null);
            return;
        }

        // Handle worker messages
        worker.onmessage = (event) => {
            const { status, response, error, progress } = event.data;

            console.log('📨 [Turbopack] Upload worker message:', { status, progress });

            switch (status) {
                case 'progress':
                    if (setProgress) {
                        setProgress({
                            fileName: file.name,
                            progress: progress || 0,
                            timestamp
                        });
                    }
                    break;

                case 'success':
                    console.log('✅ [Turbopack] Upload completed:', response);

                    if (setProgress) {
                        setProgress({
                            fileName: file.name,
                            progress: 100,
                            timestamp,
                            isCompleted: true
                        });
                    }

                    cleanup(); // Clear timeout and terminate worker

                    if (response && response.secure_url && response.public_id) {
                        resolve({
                            secure_url: response.secure_url,
                            duration: response.duration || 0,
                            public_id: response.public_id,
                            resource_type: response.resource_type || type,
                        });
                    } else {
                        console.error('❌ Invalid upload response structure:', response);
                        notifications.show({
                            position: 'bottom-right',
                            title: 'Upload Failed',
                            message: 'Invalid response from upload service',
                            color: 'red',
                        });
                        resolve(null);
                    }
                    break;

                case 'error':
                    console.error('❌ [Turbopack] Upload failed:', error);

                    if (setProgress) {
                        setProgress({
                            fileName: file.name,
                            progress: 100,
                            timestamp,
                            isCompleted: true
                        });
                    }

                    cleanup(); // Clear timeout and terminate worker

                    notifications.show({
                        position: 'bottom-right',
                        title: 'Upload Failed',
                        message: typeof error === 'string' ? error : 'Resource failed to upload',
                        color: 'red',
                    });

                    resolve(null);
                    break;

                default:
                    console.warn('🤔 [Turbopack] Unknown worker status:', status);
            }
        };

        worker.onerror = (error) => {
            console.error('❌ [Turbopack] Upload worker error:', error);
            cleanup(); // Clear timeout and terminate worker

            notifications.show({
                position: 'bottom-right',
                title: 'Upload Failed',
                message: 'Worker error occurred during upload',
                color: 'red',
            });

            resolve(null);
        };

        worker.onmessageerror = (error) => {
            console.error('❌ [Turbopack] Upload worker message error:', error);
            cleanup(); // Clear timeout and terminate worker

            notifications.show({
                position: 'bottom-right',
                title: 'Upload Failed',
                message: 'Data serialization error',
                color: 'red',
            });

            resolve(null);
        };

        // Send upload task to worker
        try {
            worker.postMessage({
                file,
                fileKeyName: 'file',
                folder: lectureId,
                type,
                bffApiUrl: process.env.NEXT_PUBLIC_BFF_HOST_API
            });

            console.log('📤 [Turbopack] Upload task sent to worker');

        } catch (error) {
            console.error('❌ [Turbopack] Failed to send upload task:', error);
            cleanup(); // Clear timeout and terminate worker

            notifications.show({
                position: 'bottom-right',
                title: 'Upload Failed',
                message: 'Failed to start upload process',
                color: 'red',
            });

            resolve(null);
        }

        // Timeout protection
        const timeoutDuration = Math.max(60000, file.size / 1024 / 1024 * 10000);
        timeoutId = setTimeout(() => {
            console.error('⏰ [Turbopack] Upload worker timeout');
            cleanup(); // This will clear the timeout (though it's already fired) and terminate worker

            notifications.show({
                position: 'bottom-right',
                title: 'Upload Timeout',
                message: `Upload of ${file.name} timed out`,
                color: 'red',
            });

            resolve(null);
        }, timeoutDuration);
    });
};

// Rest of your deleteAssetWebWorker code remains the same...
interface AssetItem {
    publicId: string;
    type: 'image' | 'video' | 'raw' | 'auto';
}

interface DeleteAssetParams {
    assetsList: AssetItem[];
}

interface WorkerResponse {
    status: 'success' | 'error';
    results?: any;
    error?: string;
}

interface DeleteAssetResult {
    success: boolean;
    results?: any;
    error?: string;
}

export const deleteAssetWebWorker = async ({ assetsList }: DeleteAssetParams): Promise<DeleteAssetResult> => {
    console.log('🚀 [Turbopack] deleteAssetWebWorker :: assetsList:', assetsList);

    return new Promise((resolve) => {
        let worker: Worker | null = null;
        let isResolved = false;

        const cleanup = () => {
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
                resolveOnce({ success: false, error: 'Web Workers not supported in this environment' });
                return;
            }

            // FIXED: Use different file extension to avoid worker loader
            worker = new Worker(/* turbopackIgnore: true */ "/deleteWorker.js");
            console.log('✅ [Turbopack] Worker created successfully');

        } catch (error) {
            console.error('❌ [Turbopack] Failed to create worker:', error);
            resolveOnce({ success: false, error: 'Failed to create worker' });
            return;
        }

        // Set up worker event handlers
        worker.onmessage = (event) => {
            const { status, results, error }: WorkerResponse = event.data;
            console.log('📨 [Turbopack] Worker response:', { status, results, error });

            if (status === 'success') {
                resolveOnce({ success: true, results });
            } else {
                resolveOnce({ success: false, error: error || 'Unknown worker error' });
            }
        };

        worker.onerror = (error) => {
            console.error('❌ [Turbopack] Worker error:', error);
            resolveOnce({ success: false, error: error.message || 'Worker execution error' });
        };

        worker.onmessageerror = (error) => {
            console.error('❌ [Turbopack] Worker message error:', error);
            resolveOnce({ success: false, error: 'Message serialization error' });
        };

        // Send message to worker
        try {
            const bffApiUrl = process.env.NEXT_PUBLIC_BFF_HOST_API;
            if (!bffApiUrl) {
                console.error('❌ [Turbopack] BFF API URL not configured');
                resolveOnce({ success: false, error: 'BFF API URL not configured' });
                return;
            }

            worker.postMessage({ assetsList, bffApiUrl });
            console.log('📤 [Turbopack] Message sent to worker');
        } catch (error) {
            console.error('❌ [Turbopack] Failed to send message:', error);
            resolveOnce({ success: false, error: 'Failed to send message to worker' });
            return;
        }

        // Set timeout
        const timeoutId = setTimeout(() => {
            console.error('⏰ [Turbopack] Worker timeout');
            resolveOnce({ success: false, error: 'Worker timeout after 30 seconds' });
        }, 30000);

        // Clear timeout if resolved early
        const originalResolve = resolve;
        resolve = (result: DeleteAssetResult) => {
            clearTimeout(timeoutId);
            originalResolve(result);
        };
    });
};