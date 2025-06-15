import { notifications } from '@mantine/notifications';
import { removeTempImageFromEditor, replaceImageLinksOnContentPreview } from './EditorUtils';

interface UploadResponse {
    secure_url: string;
    public_id: string;
    timestamp: string;
    resource_type: string;
}

interface ProgressEntry {
    fileName: string;
    progress: number;
    timestamp: string;
    isCompleted?: boolean;
}

export const uploadDataWebWorker = async ({
    file,
    tempUrl,
    editor,
    folder,
    type,
    setProgress
}: any): Promise<void> => {
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
            // FIXED: Use native worker path to avoid bundler issues
            worker = new Worker(/* turbopackIgnore: true */ "/uploadWorker.js");
            console.log('✅ [Turbopack] Upload worker created for:', file.name);

        } catch (error) {
            console.error('❌ [Turbopack] Failed to create upload worker:', error);
            cleanup();
            removeTempImageFromEditor({ editor, tempUrl });
            notifications.show({
                title: 'Upload Failed',
                message: 'Failed to initialize upload worker',
                color: 'red'
            });
            reject(error);
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
                            timestamp: timestamp.toString()
                        });
                    }
                    break;

                case 'success':
                    console.log('✅ [Turbopack] Upload completed:', response);
                    cleanup();

                    if (response && response.secure_url && response.public_id) {
                        const result: UploadResponse = {
                            secure_url: response.secure_url,
                            public_id: response.public_id,
                            timestamp: (response.timestamp || timestamp).toString(),
                            resource_type: response.resource_type || type,
                        };

                        // Process the successful upload
                        const imageUrl = result.secure_url;
                        if (result.public_id) {
                            // Import and use the localStorage function
                            import('../../../utils/worker/workerWithLocalStorage').then(({ addUploadedAsset }) => {
                                const success = addUploadedAsset(result.public_id, result.resource_type);
                                if (!success) {
                                    console.warn('Failed to save asset to localStorage');
                                }
                            }).catch((error) => {
                                console.error('Error importing localStorage utilities:', error);
                            });
                        }

                        // Replace uploaded new cloudinary link on editor 
                        replaceImageLinksOnContentPreview({
                            setProgress,
                            timestamp: result.timestamp,
                            file,
                            tempUrl,
                            imageUrl,
                            editor
                        }).then(() => {
                            resolve();
                        }).catch(reject);

                    } else {
                        console.error('❌ Invalid upload response structure:', response);
                        removeTempImageFromEditor({ editor, tempUrl });
                        notifications.show({
                            title: 'Upload Failed',
                            message: 'Invalid response from upload service',
                            color: 'red'
                        });
                        reject(new Error('Invalid response structure'));
                    }
                    break;

                case 'error':
                    console.error('❌ [Turbopack] Upload failed:', error);
                    cleanup();
                    removeTempImageFromEditor({ editor, tempUrl });
                    notifications.show({
                        title: 'Upload Failed',
                        message: typeof error === 'string' ? error : 'Asset failed to upload',
                        color: 'red'
                    });
                    reject(new Error(error));
                    break;

                default:
                    console.warn('🤔 [Turbopack] Unknown worker status:', status);
            }
        };

        worker.onerror = (error) => {
            console.error('❌ [Turbopack] Upload worker error:', error);
            cleanup();
            removeTempImageFromEditor({ editor, tempUrl });
            notifications.show({
                title: 'Upload Failed',
                message: 'Worker error occurred during upload',
                color: 'red'
            });
            reject(error);
        };

        worker.onmessageerror = (error) => {
            console.error('❌ [Turbopack] Upload worker message error:', error);
            cleanup();
            removeTempImageFromEditor({ editor, tempUrl });
            notifications.show({
                title: 'Upload Failed',
                message: 'Data serialization error',
                color: 'red'
            });
            reject(error);
        };

        // Send upload task to worker
        try {
            worker.postMessage({
                file,
                fileKeyName: 'file',
                folder,
                type,
                bffApiUrl: process.env.NEXT_PUBLIC_BFF_HOST_API
            });

            console.log('📤 [Turbopack] Upload task sent to worker');

        } catch (error) {
            console.error('❌ [Turbopack] Failed to send upload task:', error);
            cleanup();
            removeTempImageFromEditor({ editor, tempUrl });
            notifications.show({
                title: 'Upload Failed',
                message: 'Failed to start upload process',
                color: 'red'
            });
            reject(error);
        }

        // Timeout protection
        const timeoutDuration = Math.max(60000, file.size / 1024 / 1024 * 10000);
        timeoutId = setTimeout(() => {
            console.error('⏰ [Turbopack] Upload worker timeout');
            cleanup();
            removeTempImageFromEditor({ editor, tempUrl });
            notifications.show({
                title: 'Upload Timeout',
                message: `Upload of ${file.name} timed out`,
                color: 'red'
            });
            reject(new Error('Upload timeout'));
        }, timeoutDuration);
    });
};

// Update deleteDataWebWorker to use native worker as well
export const deleteDataWebWorker = async ({ assetsList }: any): Promise<boolean> => {
    console.log('🚀 [Turbopack] deleteDataWebWorker :: assetsList:', assetsList);

    return new Promise((resolve) => {
        let worker: Worker | null = null;
        let isResolved = false;

        const cleanup = () => {
            if (worker) {
                worker.terminate();
                worker = null;
            }
        };

        const resolveOnce = (result: boolean) => {
            if (!isResolved) {
                isResolved = true;
                cleanup();
                resolve(result);
            }
        };

        try {
            // FIXED: Use native worker path
            worker = new Worker(/* turbopackIgnore: true */ "/deleteWorker.js");
            console.log('✅ [Turbopack] Delete worker created successfully');

        } catch (error) {
            console.error('❌ [Turbopack] Failed to create delete worker:', error);
            resolveOnce(false);
            return;
        }

        // Set up worker event handlers
        worker.onmessage = (event) => {
            const { status, results, error } = event.data;
            console.log('📨 [Turbopack] Delete worker response:', { status, results, error });

            if (status === 'success') {
                // Import and use the localStorage function
                import('../../../utils/worker/workerWithLocalStorage').then(({ removeAllUploadedAsset }) => {
                    removeAllUploadedAsset(); // This is synchronous, no .then() needed
                    resolveOnce(true);
                }).catch(() => {
                    resolveOnce(true); // Still resolve as the main delete succeeded
                });
            } else {
                resolveOnce(false);
            }
        };

        worker.onerror = (error) => {
            console.error('❌ [Turbopack] Delete worker error:', error);
            resolveOnce(false);
        };

        worker.onmessageerror = (error) => {
            console.error('❌ [Turbopack] Delete worker message error:', error);
            resolveOnce(false);
        };

        // Send message to worker
        try {
            const bffApiUrl = process.env.NEXT_PUBLIC_BFF_HOST_API;
            if (!bffApiUrl) {
                console.error('❌ [Turbopack] BFF API URL not configured');
                resolveOnce(false);
                return;
            }

            worker.postMessage({ assetsList, bffApiUrl });
            console.log('📤 [Turbopack] Delete task sent to worker');
        } catch (error) {
            console.error('❌ [Turbopack] Failed to send delete task:', error);
            resolveOnce(false);
            return;
        }

        // Set timeout
        const timeoutId = setTimeout(() => {
            console.error('⏰ [Turbopack] Delete worker timeout');
            resolveOnce(false);
        }, 30000);

        // Clear timeout if resolved early
        const originalResolve = resolve;
        resolve = (result: boolean) => {
            clearTimeout(timeoutId);
            originalResolve(result);
        };
    });
};

// Keep all your existing utility functions unchanged
export const extractCloudinaryLinksFromContent = (content: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const links: string[] = [];

    const elements = doc.querySelectorAll('img, audio, video, a');

    elements.forEach(el => {
        const src = el.getAttribute('src');
        const href = el.getAttribute('href');
        if (src && src.includes('cloudinary')) {
            links.push(src);
        }
        if (href && href.includes('cloudinary')) {
            links.push(href);
        }
    });

    return links;
};

export const extractPublicIdsFromLinks = (links: string[]) => {
    return links.map(link => {
        const parts = link.split('/');
        const lastPart = parts.slice(-2).join('/');
        return lastPart.split('.')[0];
    });
};

const mediaTypes = ['image', 'video', 'raw'];

export const extractPublicIdsAndTypeFromLinks = (links: any[]) => {
    return links.map((link: string) => {
        const parts = link.split('/');
        const lastPart = parts.slice(-2).join('/');
        const publicId = lastPart.split('.')[0];
        const type = parts.find((part: string) => mediaTypes.includes(part)) || 'image';

        return {
            publicId,
            type
        };
    });
};

export const cloudinaryAssetsUploadCleanup = ({ content }: any) => {
    const cloudinaryLinksFromContent = extractCloudinaryLinksFromContent(content);
    const usedPublicIdsInEditor = extractPublicIdsFromLinks([...cloudinaryLinksFromContent]);

    import('../../../utils/worker/workerWithLocalStorage').then(({ removeUploadedAssetsList }) => {
        const success = removeUploadedAssetsList(usedPublicIdsInEditor);
        if (!success) {
            console.warn('Failed to remove uploaded assets from localStorage');
        }
    }).catch((error) => {
        console.error('Error importing localStorage utilities:', error);
    });

    return cloudinaryLinksFromContent ? extractPublicIdsAndTypeFromLinks([...cloudinaryLinksFromContent]) : []
}

export const cloudinaryAssetsUploadCleanupForUpdate = ({ oldContent, newContent }: any) => {
    const cloudinaryLinksNew = newContent ? extractCloudinaryLinksFromContent(newContent) : null;
    const cloudinaryLinksPrev = oldContent ? extractCloudinaryLinksFromContent(oldContent) : null;

    const usedPublicIdsInNewEditor = cloudinaryLinksNew ? extractPublicIdsFromLinks([...cloudinaryLinksNew]) : [];
    const usedPublicIdsInPrevEditor = cloudinaryLinksPrev ? extractPublicIdsAndTypeFromLinks([...cloudinaryLinksPrev]) : [];

    import('../../../utils/worker/workerWithLocalStorage').then(({ removeUploadedAssetsList, updateUploadedAssets }) => {
        removeUploadedAssetsList(usedPublicIdsInNewEditor);

        // get the public IDs that are in the old editor but not in the updated editor
        const publicIdsNotInUpdatedEditor = usedPublicIdsInPrevEditor.filter(({ publicId }) => !usedPublicIdsInNewEditor.includes(publicId));
        // store it to on local storage so on cleanup it will be removed 
        updateUploadedAssets(publicIdsNotInUpdatedEditor);
    });

    return cloudinaryLinksNew ? extractPublicIdsAndTypeFromLinks([...cloudinaryLinksNew]) : []
}