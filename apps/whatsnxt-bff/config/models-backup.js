const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { Worker } = require('worker_threads');
const { getLogger } = require('./logger');
const logger = getLogger('models');

// Optimized: Load models in batches using worker threads
async function loadModelsInParallel(modelsDir, label, excludeFiles = []) {
    logger.info(`🎨 Loading ${label} Models in parallel...`);
    const startTime = Date.now();
    
    const files = fs.readdirSync(modelsDir)
        .filter(file => {
            if (!file.endsWith('.js') && !file.endsWith('.ts')) return false;
            if (excludeFiles.includes(file)) return false;
            return true;
        })
        .map(file => path.join(modelsDir, file));

    // Split files into batches for parallel processing
    const batchSize = Math.ceil(files.length / 4); // Use 4 workers
    const batches = [];
    for (let i = 0; i < files.length; i += batchSize) {
        batches.push(files.slice(i, i + batchSize));
    }

    // Load each batch in parallel
    const workers = batches.map(batch => {
        return new Promise((resolve, reject) => {
            batch.forEach(file => {
                try {
                    require(file);
                } catch (error) {
                    logger.error(`   ❌ Failed to load ${path.basename(file)}: ${error.message}`);
                }
            });
            resolve();
        });
    });

    await Promise.all(workers);
    
    const duration = Date.now() - startTime;
    logger.info(`✅ All ${label} models loaded in ${duration}ms`);
}

// Legacy sync function kept for compatibility
function requireAllBlogModels() {
    logger.info('🎨 Loading Blog Models...');
    const modelsDir = path.join(__dirname, '../app/models');
    fs.readdirSync(modelsDir).forEach(file => {
        // Load both .js and .ts files (ts-node can handle .ts files)
        if (file.endsWith('.js') || file.endsWith('.ts')) {
            try {
                require(path.join(modelsDir, file));
                logger.info(`   ✅ Loaded: ${file}`);
            } catch (error) {
                logger.error(`   ❌ Failed to load ${file}: ${error.message}`);
            }
        }
    });
    logger.info('✅ All blog models loaded');
}

function requireAllLabModels() {
    logger.info('🎨 Loading Lab Models...');
    const modelsDir = path.join(__dirname, '../app/models/lab');
    fs.readdirSync(modelsDir).forEach(file => {
        // Load both .js and .ts files (ts-node can handle .ts files)
        // Skip index.ts as it's just a re-export file
        if ((file.endsWith('.js') || file.endsWith('.ts')) && file !== 'index.ts') {
            try {
                require(path.join(modelsDir, file));
                logger.info(`   ✅ Loaded: ${file}`);
            } catch (error) {
                logger.error(`   ❌ Failed to load ${file}: ${error.message}`);
            }
        }
    });
    logger.info('✅ All lab models loaded');
}

// function requireAllCommonModels() {
//     logger.info('🎨 Loading Common Models...');
//     const modelsDir = path.join(__dirname, '../app/common/models');
//     fs.readdirSync(modelsDir).forEach(file => {
//         if (file.endsWith('.js')) {
//             require(path.join(modelsDir, file));
//         }
//     });
//     logger.info('✅ All common models loaded');
// }

async function registerModels() {
    logger.info('📦 Starting PARALLEL model registration...');
    const totalStartTime = Date.now();

    // Load blog and lab models in parallel
    await Promise.all([
        loadModelsInParallel(
            path.join(__dirname, '../app/models'),
            'Blog',
            []
        ),
        loadModelsInParallel(
            path.join(__dirname, '../app/models/lab'),
            'Lab',
            ['index.ts']
        )
    ]);

    const blogModelCount = Object.keys(mongoose.models).length;
    const totalDuration = Date.now() - totalStartTime;
    
    logger.info(`\n📊 REGISTRATION SUMMARY:`);
    logger.info(`   ⚡ Total loading time: ${totalDuration}ms`);
    logger.info(`   🎉 Total models registered: ${blogModelCount}\n`);

    logger.info(`📋 All registered models:`);
    Object.keys(mongoose.models).forEach((model, index) => {
        logger.info(`   ${index + 1}. ${model}`);
    });

    return Object.keys(mongoose.models);
}

module.exports = { registerModels };