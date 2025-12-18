const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { getLogger } = require('./logger');
const logger = getLogger('models');

/**
 * Optimized model registration using Promise.all for parallel loading
 * This approach loads models concurrently while maintaining the same connection
 */

async function loadModelFile(filePath) {
    return new Promise((resolve, reject) => {
        try {
            require(filePath);
            resolve({ success: true, file: path.basename(filePath) });
        } catch (error) {
            resolve({ success: false, file: path.basename(filePath), error: error.message });
        }
    });
}

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

    // Load all files in parallel using Promise.all
    const results = await Promise.all(
        files.map(file => loadModelFile(file))
    );

    // Log results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    successful.forEach(r => logger.info(`   ✅ Loaded: ${r.file}`));
    failed.forEach(r => logger.error(`   ❌ Failed to load ${r.file}: ${r.error}`));
    
    const duration = Date.now() - startTime;
    logger.info(`✅ ${successful.length}/${results.length} ${label} models loaded in ${duration}ms`);
    
    return { successful, failed, duration };
}

async function registerModels() {
    logger.info('📦 Starting OPTIMIZED PARALLEL model registration...');
    const totalStartTime = Date.now();

    // Load blog and lab models in parallel
    const [blogResults, labResults] = await Promise.all([
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

    const totalModels = Object.keys(mongoose.models).length;
    const totalDuration = Date.now() - totalStartTime;
    const totalSuccessful = blogResults.successful.length + labResults.successful.length;
    const totalFailed = blogResults.failed.length + labResults.failed.length;
    
    logger.info(`\n⚡ OPTIMIZED REGISTRATION SUMMARY:`);
    logger.info(`   ⏱️  Total loading time: ${totalDuration}ms`);
    logger.info(`   ✅ Successfully loaded: ${totalSuccessful}`);
    logger.info(`   ❌ Failed to load: ${totalFailed}`);
    logger.info(`   🎉 Total models registered: ${totalModels}\n`);

    if (totalFailed > 0) {
        logger.warn(`⚠️  Some models failed to load. Check logs above for details.`);
    }

    logger.info(`📋 All registered models:`);
    Object.keys(mongoose.models).forEach((model, index) => {
        logger.info(`   ${index + 1}. ${model}`);
    });

    return Object.keys(mongoose.models);
}

module.exports = { registerModels };
