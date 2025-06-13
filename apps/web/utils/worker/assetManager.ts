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
        const timestamp = Date.now();

        try {
            // FIXED: Use different file extension to avoid worker loader
            worker = new Worker(/* turbopackIgnore: true */ "/uploadWorker.js");

            console.log('✅ [Turbopack] Upload worker created for:', file.name);

        } catch (error) {
            console.error('❌ [Turbopack] Failed to create upload worker:', error);
            notifications.show({
                position: 'bottom-left',
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

                    worker.terminate();

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
                            position: 'bottom-left',
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

                    worker.terminate();

                    notifications.show({
                        position: 'bottom-left',
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
            worker.terminate();

            notifications.show({
                position: 'bottom-left',
                title: 'Upload Failed',
                message: 'Worker error occurred during upload',
                color: 'red',
            });

            resolve(null);
        };

        worker.onmessageerror = (error) => {
            console.error('❌ [Turbopack] Upload worker message error:', error);
            worker.terminate();

            notifications.show({
                position: 'bottom-left',
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
            worker.terminate();

            notifications.show({
                position: 'bottom-left',
                title: 'Upload Failed',
                message: 'Failed to start upload process',
                color: 'red',
            });

            resolve(null);
        }

        // Timeout protection
        const timeoutDuration = Math.max(60000, file.size / 1024 / 1024 * 10000);
        setTimeout(() => {
            console.error('⏰ [Turbopack] Upload worker timeout');
            worker.terminate();

            notifications.show({
                position: 'bottom-left',
                title: 'Upload Timeout',
                message: `Upload of ${file.name} timed out`,
                color: 'red',
            });

            resolve(null);
        }, timeoutDuration);
    });
};

export const deleteAssetWebWorker = async ({ assetsList }: any) => {
    console.log('🚀 [Turbopack] deleteAssetWebWorker :: assetsList:', assetsList);

    return new Promise((resolve, reject) => {
        let worker: Worker;

        try {
            // FIXED: Use different file extension to avoid worker loader
            worker = new Worker(/* turbopackIgnore: true */ "/deleteWorker.js");

            console.log('✅ [Turbopack] Worker created successfully');

        } catch (error) {
            console.error('❌ [Turbopack] Failed to create worker:', error);
            resolve({ success: false, error: 'Failed to create worker' });
            return;
        }

        worker.onmessage = (event) => {
            const { status, results, error } = event.data;
            console.log('📨 [Turbopack] Worker response:', { status, results, error });

            worker.terminate();

            if (status === 'success') {
                resolve({ success: true, results });
            } else {
                resolve({ success: false, error });
            }
        };

        worker.onerror = (error) => {
            console.error('❌ [Turbopack] Worker error:', error);
            worker.terminate();
            resolve({ success: false, error: error.message });
        };

        worker.onmessageerror = (error) => {
            console.error('❌ [Turbopack] Worker message error:', error);
            worker.terminate();
            resolve({ success: false, error: 'Message serialization error' });
        };

        try {
            worker.postMessage({ assetsList, bffApiUrl: process.env.NEXT_PUBLIC_BFF_HOST_API });
            console.log('📤 [Turbopack] Message sent to worker');
        } catch (error) {
            console.error('❌ [Turbopack] Failed to send message:', error);
            worker.terminate();
            resolve({ success: false, error: 'Failed to send message to worker' });
        }

        setTimeout(() => {
            console.error('⏰ [Turbopack] Worker timeout');
            worker.terminate();
            resolve({ success: false, error: 'Worker timeout' });
        }, 30000);
    });
};