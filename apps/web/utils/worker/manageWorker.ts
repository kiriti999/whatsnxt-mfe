/**
 * Manages a web worker, sending a payload and handling responses.
 * @param {Worker} worker - The web worker instance.
 * @param {Object} payload - Data to be sent to the worker.
 * @param {Function} [onProgress=null] - Optional callback function to track progress updates.
 * @returns {Promise} A promise that resolves with the worker's response on success or rejects on error.
 */
export const manageWorker = (worker, payload, onProgress = null) => {
    // Return a promise that will be resolved or rejected based on worker's response
    return new Promise((resolve, reject) => {
        // Generate a unique timestamp for tracking purposes
        const timestamp = Date.now();

        // Define a message handler for the worker
        worker.onmessage = function (e) {
            const { status, response, error, progress } = e.data;

            // Handle 'progress' status from the worker
            if (status === 'progress') {
                // If there is a file name and a progress callback, call onProgress
                if (payload?.file?.name && onProgress) {
                    onProgress({ fileName: payload.file.name, progress, timestamp });
                }

            // Handle 'success' status from the worker
            } else if (status === 'success') {
                // Resolve the promise with the response data and timestamp
                resolve({ ...response, timestamp });

                // Terminate the worker as its job is done
                worker.terminate();

            // Handle 'error' status from the worker
            } else if (status === 'error') {
                // Optionally report the final progress as completed in case of error
                onProgress && onProgress({ fileName: payload?.file?.name, timestamp, progress: 100, isCompleted: true });

                // Reject the promise with the error received from the worker
                reject(error);

                // Terminate the worker since an error occurred
                worker.terminate();
            }
        };

        // Send the initial payload to start the worker's task
        worker.postMessage({ ...payload });
    });
};
