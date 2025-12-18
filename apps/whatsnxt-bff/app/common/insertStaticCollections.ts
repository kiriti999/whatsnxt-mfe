// seedUtils.js
import { getLogger } from "../../config/logger";
const logger = getLogger("insertStaticCollections");
import {
  BLOG_CATEGORIES,
  COURSE_CATEGORIES,
  LANGUAGES,
} from "../common/constants";

const acquireSeedLock = async (lockId, lockTimeout, db) => {
  try {
    const locksCollection = db.collection("locks");
    const now = new Date();
    const lock = await locksCollection.findOneAndUpdate(
      { _id: lockId },
      { $setOnInsert: { locked: true, createdAt: now } },
      { upsert: true, returnDocument: "after" },
    );
    if (
      lock.lastErrorObject?.updatedExisting &&
      now.getTime() - new Date(lock.value.createdAt).getTime() < lockTimeout
    ) {
      logger.info(`Lock "${lockId}" already in progress, skipping...`);
      return false;
    }
    logger.info(`Lock "${lockId}" acquired successfully.`);
    return true;
  } catch (error) {
    logger.error("Error acquiring lock:", error);
    return false;
  }
};

const releaseSeedLock = async (lockId, db) => {
  try {
    const locksCollection = db.collection("locks");
    await locksCollection.deleteOne({ _id: lockId });
    logger.info(`Lock "${lockId}" released.`);
  } catch (error) {
    logger.error(`Error releasing lock "${lockId}":`, error);
  }
};

const insertDataWithLock = async (
  collectionName,
  lockId,
  data,
  uniqueIndexField,
  db,
  lockTimeout = 60 * 1000,
) => {
  try {
    const collection = db.collection(collectionName);

    // Acquire lock
    const lockAcquired = await acquireSeedLock(lockId, lockTimeout, db);
    if (!lockAcquired) {
      logger.info(`${collectionName}:: Lock not acquired, skipping seeding.`);
      return;
    }

    const documentCount = await collection.countDocuments();
    const isCollectionEmpty = documentCount === 0;

    logger.info(
      `${collectionName}:: Document count: ${documentCount}, isEmpty: ${isCollectionEmpty}`,
    );

    if (isCollectionEmpty) {
      if (uniqueIndexField) {
        try {
          await collection.createIndex(
            { [uniqueIndexField]: 1 },
            { unique: true },
          );
          logger.info(
            `${collectionName}:: Created unique index on ${uniqueIndexField}`,
          );
        } catch (indexError) {
          logger.warn(
            `${collectionName}:: Failed to create index:`,
            indexError.message,
          );
        }
      }
      if (data && Array.isArray(data) && data.length > 0) {
        const insertResult = await collection.insertMany(data, {
          ordered: false,
        });
        logger.info(
          `${collectionName}:: Data inserted successfully. Count: ${insertResult.insertedCount}`,
        );
      } else {
        logger.info(`${collectionName}:: No data provided for insertion.`);
      }
    } else {
      logger.info(
        `${collectionName}:: Data already exists, skipping insertion.`,
      );
    }

    await releaseSeedLock(lockId, db);
  } catch (error) {
    logger.error(`${collectionName}:: Error during seeding:`, error);
    logger.error(`${collectionName}:: Error details:`, error.message);
    try {
      await releaseSeedLock(lockId, db);
    } catch (lockError) {
      logger.error(
        `${collectionName}:: Failed to release lock after error:`,
        lockError,
      );
    }
  }
};

const insertBlogCategories = async (db) => {
  try {
    logger.info("Starting blog categories seeding...");
    await insertDataWithLock(
      "blogCategories",
      "blog-categories-seed-lock",
      BLOG_CATEGORIES,
      "categoryName", // Changed from 'name' to 'categoryName'
      db,
    );
    logger.info("Blog categories seeding completed.");
  } catch (error) {
    logger.error("Error during blog categories seeding:", error);
    throw error;
  }
};

const insertCourseCategories = async (db) => {
  try {
    logger.info("Starting course categories seeding...");
    await insertDataWithLock(
      "courseCategories",
      "course-categories-seed-lock",
      COURSE_CATEGORIES,
      "categoryName", // Changed from 'name' to 'categoryName'
      db,
    );
    logger.info("Course categories seeding completed.");
  } catch (error) {
    logger.error("Error during course categories seeding:", error);
    throw error;
  }
};

const insertLanguages = async (db) => {
  try {
    logger.info("Starting languages seeding...");
    await insertDataWithLock(
      "languages", // Collection name
      "languages-seed-lock", // Lock ID
      LANGUAGES, // Data to insert
      "name",
      db,
    );
  } catch (error) {
    logger.info(" insertLanguages :: error:", error);
  }
};

const seedAllCategories = async (db) => {
  try {
    logger.info("Starting comprehensive categories seeding...");
    await Promise.all([
      insertBlogCategories(db),
      insertCourseCategories(db),
      insertLanguages(db),
    ]);
    logger.info("All categories seeding completed successfully.");
  } catch (error) {
    logger.error("Error during comprehensive categories seeding:", error);
    throw error;
  }
};

export {
  acquireSeedLock,
  releaseSeedLock,
  insertDataWithLock,
  insertBlogCategories,
  insertCourseCategories,
  insertLanguages,
  seedAllCategories,
};
