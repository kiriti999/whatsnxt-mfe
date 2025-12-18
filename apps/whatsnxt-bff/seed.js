const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const v4 = require('uuid').v4;
var Redis = require('ioredis');
const algoliasearch = require('algoliasearch');
const { CATEGORIES } = require('./app/createCategories');

const dotenv = require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const isProduction = process.env.NODE_ENV === 'prod';
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
let algoliaClient = null;
let algoliaIndex = null;


const createAlgoliaClient = () => {
    algoliaClient = algoliasearch(
        process.env.ALGOLIA_APP_ID,
        process.env.ALGOLIA_SEARCH_ADMIN_KEY,
    );
    algoliaIndex = algoliaClient.initIndex(process.env.ALGOLIA_INDEX_NAME);
};

const dbName = `whatsnxt-${process.env.NODE_ENV}`;

const logger = require('./config/logger');

logger.info('seed.js:: dbName: %s', dbName);

let db;
const loadDB = async () => {
    if (db) {
        return db;
    }
    try {
        let mongoUrl = `${process.env.MONGODB_URL}-${process.env.NODE_ENV}`
        logger.info('mongoUrl for selected env is: %s', mongoUrl)
        const client = await MongoClient.connect(mongoUrl);
        db = client.db(dbName);
    } catch (err) {
        logger.error('seed.js:: err: %o', err);
    }
    return db;
};

async function init() {
    if (!isProduction) await dropDatabase();
    const redisUrl = `redis://${REDIS_HOST}:${REDIS_PORT}`;
    var redis = new Redis(redisUrl);

    // Create a readable stream (object mode)
    var stream = redis.scanStream({
        match: 'sample_pattern:*'
    });
    stream.on('data', function (keys) {
        // `keys` is an array of strings representing key names
        if (keys.length) {
            var pipeline = redis.pipeline();
            keys.forEach(function (key) {
                pipeline.del(key);
            });
            pipeline.exec();
        }
    });
    stream.on('end', function () {
        logger.info('Redis cache has been deleted!!');
    });
    const insertResult = await insertCategories();
    createAlgoliaClient();
    await algoliaIndex.clearObjects({ indexName: process.env.ALGOLIA_INDEX_NAME });
    if (!isProduction) {
        const user = await createUser();
        const posts = await createPosts(user, insertResult);
        logger.info('🚀 ~ init ~ posts: %o', posts)
        await insertPosts(posts);
    }
}

async function dropDatabase() {
    const db = await loadDB();
    const dbList = (await getDbLists()).databases;
    if (isDbExists(dbList, dbName)) {
        logger.info('seed.js:: db exists');
        db.dropDatabase()
    }
}

async function getDbLists() {
    const db = await loadDB();
    let adminDB = db.admin();
    const lists = await adminDB.listDatabases();
    logger.info('seed.js:: getDbLists: %o', lists);
    return lists;
}

const isDbExists = (dbList, dbName) => dbList.some((e) => e.name === dbName);

// const insertCategories = async () => {
//     const db = await loadDB();
//     let collection = db.collection('categories');
//     const insertCategoriesResult = await collection.insertMany(CATEGORIES);
//     console.log('Seed.js:: insertCategories:: insertCategoriesResult:', insertCategoriesResult);
//     return insertCategoriesResult;
// }

async function createUser() {
    try {
        const email = 'test@test.com'
        const password = 'Secure@123'
        const confirmToken = v4();
        const user = await db.collection('users').find({ email });
        if (user.length) {
            throw new Error(`User already exist with email ${email}`)
        } else {
            const passwordHash = await bcrypt.hash(password, 10)

            const payload = {
                name: 'testUser',
                email: 'test@test.com',
                password: passwordHash,
                emailResetToken: confirmToken,
                role: 'admin',
                active: true,
                as_trainer_apply: true,
                skills: ["aws", "nodejs", "javascript", "mongodb", "reactjs", "nextjs"],
                rating: 5,
                rate: 500,
                availability: '6AM to 8AM and 5PM to 9PM IST',
                about: 'Experienced fullstack professional with 11+ years of experience'
            }

            const record = await db.collection('users').insertOne(payload);
            const newUser = { id: record.insertedId, ...payload }
            logger.info('seeds.js:: newUser: %o', newUser);
            return newUser;
        }
    } catch (error) {
        logger.error('seed.js:: createUser:: error: %o', error)
    }
}

const insertPosts = async (posts) => {
    logger.info('🚀 ~ insertPosts ~ posts: %o', posts);
    try {
        let collection = db.collection('courses');
        const result = await collection.insertMany(posts);
        logger.info('Seed.js:: Inserted posts documents: %o', result);

        // Insert at least two videos for each post
        let videoCollection = db.collection('videos');
        const videoPromises = Object.keys(result.insertedIds).map(async (key, index) => {
            const courseId = result.insertedIds[key]; // Get the inserted courseId
            const post = posts[index]; // Get the corresponding post

            // Video 1
            const videoDocument1 = {
                isPreview: true, // Example for preview video
                video_url: `https://example.com/video_${post.slug}_preview.mp4`, // Example video URL
                video_duration: 120, // Example duration in seconds
                order: 1, // Example order for the first video
                name: `${post.title} Course Preview`, // Name of the first video
                description: `Preview video for ${post.title}`, // Description of the first video
                courseId: courseId, // Reference to the inserted courseId
                userId: post.userId // Same userId as the post
            };

            // Video 2
            const videoDocument2 = {
                isPreview: false, // Example for full course video
                video_url: `https://example.com/video_${post.slug}_full.mp4`, // Example full video URL
                video_duration: 3600, // Example duration for a full course video (1 hour)
                order: 2, // Example order for the second video
                name: `${post.title} Full Course`, // Name of the second video
                description: `Full course video for ${post.title}`, // Description of the second video
                courseId: courseId, // Reference to the inserted courseId
                userId: post.userId // Same userId as the post
            };

            // Insert both videos and return the result
            return await videoCollection.insertMany([videoDocument1, videoDocument2]);
        });

        // Wait for all video insertions to complete and log the results
        const videoResults = await Promise.all(videoPromises);
        logger.info('Seed.js:: Inserted video documents: %o', videoResults);

    } catch (error) {
        logger.error('insertPosts:: error: %o', error);
    }
};


// Assuming `Post` type is already defined
async function indexPost(post) {
    try {
        const record = {
            objectID: post.algoliaId,
            title: post.title,
            slug: post.slug,
            overview: post.overview,
            published: post.published, // Coming from the post object
            imageUrl: post.imageUrl, // Using post's imageUrl
            course_preview_video: post.course_preview_video, // Using post's course_preview_video
            duration: post.duration, // Using post's duration
            lessons: post.lessons, // Using post's lessons
            total_cost: post.total_cost, // Using post's total_cost
            video_course_price: post.video_course_price, // Using post's video_course_price
            live_training_price: post.live_training_price, // Using post's live_training_price
            categoryName: post.categoryName, // Using post's categoryName
            categoryId: post.categoryId, // Using post's categoryId
            userId: post.userId, // Using post's userId
            user: post.user, // Using post's user array
            rating: post.rating, // Using post's rating
            enrolled_courses: post.enrolled_courses, // Using post's enrolled_courses array
            purchaseCount: post.purchaseCount, // Using post's purchaseCount
            updated_at: post.updated_at // Using post's updated_at
        };

        const algoliaResponse = await algoliaIndex.saveObject(record);
        logger.info('algolia.js:: algoliaResponse: %o', algoliaResponse);
        return algoliaResponse;
    } catch (error) {
        logger.error('algolia.js:: error: %o', error);
    }
}


const createPosts = async (user, insertResult) => {
    const posts = [];

    for (let i = 0; i < insertResult.insertedCount; i++) {
        const insertedId = insertResult.insertedIds[i].toString();
        const categoryName = CATEGORIES[i].name;
        posts.push({
            algoliaId: Date.now(),
            "title": `course title is ${categoryName}`,
            "slug": `course-title-is-${categoryName}`,
            overview: `<p>${categoryName}</p>`,
            published: true,
            imageUrl: `https://ik.imagekit.io/kiriti369/whatsnxt-common-categories/misc.png`,
            course_preview_video: "",
            duration: "1 day",
            lessons: "1",
            total_cost: 200, // Overwritten to 200
            video_course_price: 100,
            live_training_price: i % 2 === 0 ? 100 : 200,
            categoryName,
            categoryId: insertedId,
            userId: user.id,
            user: [], // This can be replaced with actual user data
            rating: i % 2 === 0 ? 3 : 5,
            rateArray: [],
            enrolled_courses: [],
            purchaseCount: i % 2 === 0 ? 0 : 1,
            updated_at: new Date(Date.now()).toISOString(),
        });

        await indexPost(posts[i]); // Assuming this is a function available elsewhere in the code
    }

    return posts;
};

init();

