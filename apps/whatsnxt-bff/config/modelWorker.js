const { parentPort, workerData } = require('worker_threads');
const mongoose = require('mongoose');
const path = require('path');

// Connect to MongoDB in worker thread
async function loadModels() {
    try {
        const { mongoUri, modelFiles } = workerData;
        
        // Connect to MongoDB
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: false, // Disable auto-indexing in workers for faster load
        });

        const loadedModels = [];
        const errors = [];

        // Load each model file
        for (const file of modelFiles) {
            try {
                require(file);
                loadedModels.push(path.basename(file));
            } catch (error) {
                errors.push({
                    file: path.basename(file),
                    error: error.message
                });
            }
        }

        // Get registered model names
        const registeredModels = Object.keys(mongoose.models);

        // Close connection
        await mongoose.disconnect();

        // Send results back to parent
        parentPort.postMessage({
            success: true,
            loadedModels,
            registeredModels,
            errors
        });

    } catch (error) {
        parentPort.postMessage({
            success: false,
            error: error.message
        });
    }
}

loadModels();
