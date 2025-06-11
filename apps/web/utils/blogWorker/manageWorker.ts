export const manageWorker = (worker: any, payload: any, onProgress: any = null) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    worker.onmessage = function (e: any) {
      const { status, response, error, progress } = e.data;
      if (status === 'progress') {
        if (payload?.file?.name && onProgress) {
          onProgress({ fileName: payload.file.name, progress, timestamp });
        }
      } else if (status === 'success') {
        resolve({ ...response, timestamp });
        worker.terminate();
      } else if (status === 'error') {
        if (onProgress) {
          onProgress({ fileName: payload?.file?.name, timestamp, progress: 100, isCompleted: true });
        }
        reject(error);
        worker.terminate();
      }
    };

    // Send a payload for worker execution
    worker.postMessage({ ...payload });
  });
};
