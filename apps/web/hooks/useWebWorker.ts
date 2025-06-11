export const useWebWorker = () => {

    const uploadWorker = (worker, payload) => {

        return new Promise((resolve, reject) => {

            // runs after completion of worker execution
            worker.onmessage = function (e) {

                const { status, response, error } = e.data;
                if (status === 'success') {
                    resolve(response);
                } else {
                    reject(error);
                }
                worker.terminate();
            };

            //  send a payload for worker execution
            worker.postMessage({ ...payload });
        });
    }

    return { uploadWorker }

}