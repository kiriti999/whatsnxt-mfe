import mongoose from 'mongoose';
import { getLogger } from '../../config/logger';
const logger = getLogger('mongoIndexing');

class MongooseIndexManager {
    constructor() {
        this.models = {};
        this.initializeModels();
    }

    initializeModels() {
        try {
            // Get existing models or they should be defined elsewhere
            this.models.BlogCategory = mongoose.model('blogCategories');
            this.models.BlogPost = mongoose.model('blogPosts');
            this.models.BlogComment = mongoose.model('blogComments');
            this.models.Like = mongoose.model('likes');
            this.models.Dislike = mongoose.model('dislikes');
            this.models.User = mongoose.model('users');
            this.models.Draft = mongoose.model('drafts');
        } catch (error) {
            logger.warn('MongooseIndexManager :: initializeModels :: Some models not found:', error.message);
            // Models should be defined elsewhere in your application
        }
    }

    async ensureIndexExists(model, indexSpec, options = {}) {
        try {
            const collection = model.collection;
            const indexName = this.generateIndexName(indexSpec);

            // Check if index already exists
            const existingIndexes = await collection.getIndexes();
            const indexExists = Object.keys(existingIndexes).includes(indexName);

            if (!indexExists) {
                await model.createIndexes([{ ...indexSpec, ...options }]);
                logger.info(`✅ Created index ${indexName} on ${collection.collectionName}`);
                return true;
            } else {
                logger.info(`ℹ️  Index ${indexName} already exists on ${collection.collectionName}`);
                return false;
            }
        } catch (error) {
            logger.error(`❌ Error creating index on ${model.collection.collectionName}:`, error);
            throw error;
        }
    }

    async createMongooseIndexes() {
        try {
            logger.info('🚀 Starting Mongoose index creation...');

            // #region Blog Categories Indexes
            if (this.models.BlogCategory) {
                await this.ensureIndexExists(this.models.BlogCategory, { categoryName: 1 });
                await this.ensureIndexExists(this.models.BlogCategory, { count: 1 });
                await this.ensureIndexExists(this.models.BlogCategory, { userId: 1, categoryName: 1 });
            }
            // #endregion

            // #region Blog Posts Indexes
            if (this.models.BlogPost) {
                await this.ensureIndexExists(this.models.BlogPost, { updatedAt: -1 });
                await this.ensureIndexExists(this.models.BlogPost, { userId: 1 });
                await this.ensureIndexExists(this.models.BlogPost, { tutorialId: 1 });
                await this.ensureIndexExists(this.models.BlogPost, { userId: 1, tutorialId: 1 });
                await this.ensureIndexExists(this.models.BlogPost, { userId: 1, updatedAt: -1 });
                await this.ensureIndexExists(this.models.BlogPost, { published: 1, listed: 1 });
                await this.ensureIndexExists(this.models.BlogPost, { categoryName: 1 });
                await this.ensureIndexExists(this.models.BlogPost, { slug: 1 }, { unique: true });
                await this.ensureIndexExists(this.models.BlogPost, { tutorial: 1 });
                await this.ensureIndexExists(this.models.BlogPost, { publishedAt: -1 });
            }
            // #endregion

            // #region Drafts Indexes
            if (this.models.Draft) {
                await this.ensureIndexExists(this.models.Draft, { userId: 1, updatedAt: -1 });
                await this.ensureIndexExists(this.models.Draft, { userId: 1, tutorial: 1 });
                await this.ensureIndexExists(this.models.Draft, { slug: 1 }, { unique: true });
                await this.ensureIndexExists(this.models.Draft, { tutorial: 1 });
            }
            // #endregion

            // #region Users Indexes
            if (this.models.User) {
                await this.ensureIndexExists(this.models.User, { email: 1 }, { unique: true });
                await this.ensureIndexExists(this.models.User, { creator: 1 });
                await this.ensureIndexExists(this.models.User, { createdAt: -1 });
            }
            // #endregion

            // #region Blog Comments Indexes
            if (this.models.BlogComment) {
                await this.ensureIndexExists(this.models.BlogComment, { contentId: 1 });
                await this.ensureIndexExists(this.models.BlogComment, { contentId: 1, parentId: 1 });
                await this.ensureIndexExists(this.models.BlogComment, { contentId: 1, createdAt: -1 });
                await this.ensureIndexExists(this.models.BlogComment, { email: 1 });
                await this.ensureIndexExists(this.models.BlogComment, { userId: 1, contentId: 1 });
                await this.ensureIndexExists(this.models.BlogComment, { flags: 1 });
                await this.ensureIndexExists(this.models.BlogComment, { parentId: 1 });
            }
            // #endregion

            // #region Likes Indexes
            if (this.models.Like) {
                await this.ensureIndexExists(this.models.Like, { commentId: 1, email: 1 }, { unique: true });
                await this.ensureIndexExists(this.models.Like, { userId: 1, commentId: 1 });
                await this.ensureIndexExists(this.models.Like, { commentId: 1 });
            }
            // #endregion

            // #region Dislikes Indexes
            if (this.models.Dislike) {
                await this.ensureIndexExists(this.models.Dislike, { commentId: 1, email: 1 }, { unique: true });
                await this.ensureIndexExists(this.models.Dislike, { userId: 1, commentId: 1 });
                await this.ensureIndexExists(this.models.Dislike, { commentId: 1 });
            }
            // #endregion

            logger.info('✅ All Mongoose indexes created successfully');
            return true;

        } catch (error) {
            logger.error('❌ Error creating Mongoose indexes:', error);
            throw error;
        }
    }

    async createIndexesOnLoad() {
        try {
            // Ensure Mongoose connection is ready
            if (mongoose.connection.readyState !== 1) {
                await new Promise((resolve, reject) => {
                    if (mongoose.connection.readyState === 1) {
                        resolve();
                    } else {
                        mongoose.connection.once('connected', resolve);
                        mongoose.connection.once('error', reject);
                    }
                });
            }

            logger.info('🔄 Creating indexes on application load...');
            logger.info(`📊 Target database: ${mongoose.connection.db.databaseName}`);

            await this.createMongooseIndexes();
            logger.info('✅ Indexes created successfully on load');
            return true;

        } catch (error) {
            logger.error('❌ Error creating indexes on load:', error);
            throw error;
        }
    }

    async createCustomIndex(modelName, indexSpec, options = {}) {
        try {
            const model = mongoose.model(modelName);

            if (!model) {
                throw new Error(`Model ${modelName} not found`);
            }

            return await this.ensureIndexExists(model, indexSpec, options);

        } catch (error) {
            logger.error(`❌ Error creating custom index on ${modelName}:`, error);
            throw error;
        }
    }

    async listAllIndexes() {
        try {
            logger.info(`\n📊 Index Report for Database: ${mongoose.connection.db.databaseName}`);
            logger.info('='.repeat(60));

            const indexReport = {};
            const modelNames = Object.keys(this.models);

            for (const modelName of modelNames) {
                const model = this.models[modelName];
                if (!model) continue;

                try {
                    const collection = model.collection;
                    const indexes = await collection.getIndexes();

                    indexReport[collection.collectionName] = Object.entries(indexes).map(([name, spec]) => ({
                        name,
                        keys: spec,
                        unique: spec.unique || false,
                        sparse: spec.sparse || false
                    }));

                    logger.info(`\n📁 Collection: ${collection.collectionName}`);
                    Object.entries(indexes).forEach(([name, spec]) => {
                        const uniqueFlag = spec.unique ? ' [UNIQUE]' : '';
                        const sparseFlag = spec.sparse ? ' [SPARSE]' : '';
                        logger.info(`  📋 ${name}: ${JSON.stringify(spec)}${uniqueFlag}${sparseFlag}`);
                    });

                } catch (error) {
                    logger.error(`❌ Error listing indexes for ${modelName}:`, error.message);
                }
            }

            // Also check any additional collections in the database
            const db = mongoose.connection.db;
            const collections = await db.listCollections().toArray();

            for (const collectionInfo of collections) {
                const collectionName = collectionInfo.name;

                // Skip if we already processed this collection via models
                if (Object.values(indexReport).some(report =>
                    Object.keys(report).includes(collectionName)
                )) {
                    continue;
                }

                try {
                    const collection = db.collection(collectionName);
                    const indexes = await collection.indexes();

                    logger.info(`\n📁 Collection: ${collectionName} (No Mongoose Model)`);
                    indexes.forEach(index => {
                        const uniqueFlag = index.unique ? ' [UNIQUE]' : '';
                        const sparseFlag = index.sparse ? ' [SPARSE]' : '';
                        logger.info(`  📋 ${index.name}: ${JSON.stringify(index.key)}${uniqueFlag}${sparseFlag}`);
                    });

                } catch (error) {
                    logger.error(`❌ Error listing indexes for collection ${collectionName}:`, error.message);
                }
            }

            logger.info('\n' + '='.repeat(60));
            return indexReport;

        } catch (error) {
            logger.error('❌ Error listing indexes:', error);
            throw error;
        }
    }

    async checkDatabaseHealth() {
        try {
            const connection = mongoose.connection;
            const db = connection.db;

            logger.info('\n🏥 Mongoose Database Health Check');
            logger.info('='.repeat(40));

            // Basic connection info
            logger.info(`Status: ${this.getConnectionStatusText(connection.readyState)}`);
            logger.info(`Database: ${db.databaseName}`);
            logger.info(`Host: ${connection.host}:${connection.port}`);

            // Get database stats
            try {
                const stats = await db.stats();
                logger.info(`Collections: ${stats.collections}`);
                logger.info(`Total Objects: ${stats.objects}`);
                logger.info(`Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
                logger.info(`Index Count: ${stats.indexes}`);
                logger.info(`Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
                logger.info(`Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
            } catch (statsError) {
                logger.info('Database stats not available:', statsError.message);
            }

            // Model health check
            const modelNames = Object.keys(this.models);
            logger.info(`Registered Models: ${modelNames.join(', ')}`);

            logger.info('='.repeat(40));

            return {
                status: this.getConnectionStatusText(connection.readyState),
                database: db.databaseName,
                host: `${connection.host}:${connection.port}`,
                modelsRegistered: modelNames.length,
                connectionUptime: Date.now() - connection._connectionStartTime || 'N/A'
            };

        } catch (error) {
            logger.error('❌ Error checking database health:', error);
            throw error;
        }
    }

    getConnectionStatusText(readyState) {
        const states = {
            0: 'Disconnected',
            1: 'Connected',
            2: 'Connecting',
            3: 'Disconnecting'
        };
        return states[readyState] || 'Unknown';
    }

    generateIndexName(indexSpec) {
        return Object.keys(indexSpec)
            .map(key => `${key}_${indexSpec[key]}`)
            .join('_');
    }

    async dropIndex(modelName, indexName) {
        try {
            const model = mongoose.model(modelName);
            await model.collection.dropIndex(indexName);
            logger.info(`🗑️ Dropped index ${indexName} from ${modelName}`);
            return true;
        } catch (error) {
            logger.error(`❌ Error dropping index ${indexName} from ${modelName}:`, error);
            throw error;
        }
    }

    async dropAllIndexes(modelName, keepId = true) {
        try {
            const model = mongoose.model(modelName);
            const indexes = await model.collection.getIndexes();

            for (const indexName of Object.keys(indexes)) {
                // Skip the default _id index unless explicitly requested
                if (keepId && indexName === '_id_') {
                    continue;
                }

                try {
                    await model.collection.dropIndex(indexName);
                    logger.info(`🗑️ Dropped index ${indexName} from ${modelName}`);
                } catch (error) {
                    logger.error(`❌ Error dropping index ${indexName}:`, error.message);
                }
            }

            return true;
        } catch (error) {
            logger.error(`❌ Error dropping indexes from ${modelName}:`, error);
            throw error;
        }
    }

    async reindexCollection(modelName) {
        try {
            const model = mongoose.model(modelName);
            await model.collection.reIndex();
            logger.info(`🔄 Reindexed collection ${model.collection.collectionName}`);
            return true;
        } catch (error) {
            logger.error(`❌ Error reindexing ${modelName}:`, error);
            throw error;
        }
    }

    async getIndexStats(modelName) {
        try {
            const model = mongoose.model(modelName);
            const stats = await model.collection.aggregate([
                { $indexStats: {} }
            ]).toArray();

            logger.info(`📈 Index Statistics for ${modelName}:`);
            stats.forEach(stat => {
                logger.info(`  📊 ${stat.name}: ${stat.accesses.ops} operations since ${stat.accesses.since}`);
            });

            return stats;
        } catch (error) {
            logger.error(`❌ Error getting index stats for ${modelName}:`, error);
            throw error;
        }
    }
}

// Create singleton instance
const mongooseIndexManager = new MongooseIndexManager();

// Export both the class and convenience functions
const createMongooseIndexes = () => mongooseIndexManager.createMongooseIndexes();
const createIndexesOnLoad = () => mongooseIndexManager.createIndexesOnLoad();
const createCustomIndex = (modelName, indexSpec, options) =>
    mongooseIndexManager.createCustomIndex(modelName, indexSpec, options);
const listAllIndexes = () => mongooseIndexManager.listAllIndexes();
const checkDatabaseHealth = () => mongooseIndexManager.checkDatabaseHealth();
const generateIndexName = (indexSpec) => mongooseIndexManager.generateIndexName(indexSpec);

export {
    MongooseIndexManager,
    mongooseIndexManager,
    createMongooseIndexes,
    createIndexesOnLoad,
    createCustomIndex,
    listAllIndexes,
    checkDatabaseHealth,
    generateIndexName,

    // Additional utility functions
    dropIndex: (modelName, indexName) => mongooseIndexManager.dropIndex(modelName, indexName),
    dropAllIndexes: (modelName, keepId) => mongooseIndexManager.dropAllIndexes(modelName, keepId),
    reindexCollection: (modelName) => mongooseIndexManager.reindexCollection(modelName),
    getIndexStats: (modelName) => mongooseIndexManager.getIndexStats(modelName)
};