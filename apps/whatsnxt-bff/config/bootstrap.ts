import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { getLogger } from "./logger";
import { loadEnvironment } from "./environment";
// import { createExpressApp } from './express';
import http from "http";

// Legacy imports
// @ts-ignore
import { registerModels } from "./models";
// @ts-ignore
import {
  insertCourseCategories,
  insertBlogCategories,
  insertLanguages,
} from "../app/common/insertStaticCollections";

const logger = getLogger("bootstrap");

export interface BootstrapResult {
  app: any;
  server: http.Server;
}

export async function bootstrap(): Promise<BootstrapResult> {
  try {
    logger.info("🚀 Starting application...");

    // 1. Load environment
    loadEnvironment();

    // 2. Check required files
    checkRequiredFiles();

    // 3. Connect to MongoDB via Mongoose
    await connectMongoose();

    logger.info("");
    logger.info(
      "Mongoose connection state: %s",
      mongoose.connection.readyState,
    );
    logger.info("");

    // 4. Register models after DB connection
    await registerModels();

    // 5. Create Express app
    // 5. Create Express app (Lazy load to ensure models are registered first)
    const { createExpressApp } = require("./express");
    const app = createExpressApp();

    // 6. Start server
    const port = process.env.PORT || 4444;
    const server = app.listen(port, () => {
      logger.info(`🚀 Server ready at http://localhost:${port}`);
      logger.info(`📚 API Docs: http://localhost:${port}/api-docs`);
      logger.info(`🗄️  Database: ${mongoose.connection.db.databaseName}`);
    });

    // 7. Setup graceful shutdown
    setupGracefulShutdown(server);

    return { app, server };
  } catch (error) {
    logger.error("❌ Bootstrap failed:", error);
    throw error;
  }
}

function checkRequiredFiles() {
  const keyFilePath = path.resolve(
    __dirname,
    "../app/whatsnxt-be3287170e8e.json",
  );
  if (!fs.existsSync(keyFilePath)) {
    logger.error(`JSON key file not found at path: ${keyFilePath}`);
    process.exit(1);
  }
  process.env.GOOGLE_APPLICATION_CREDENTIALS = keyFilePath;
  logger.info("✅ GA key found");
}

async function connectMongoose() {
  const mongoUri = process.env.MONGODB_URL;
  const dbName = process.env.DATABASE_NAME;
  const env = process.env.NODE_ENV;
  const fullMongoUrl =
    process.env.MONGO_CONNECTION_STRING || `${mongoUri}/${dbName}-${env}`;

  logger.info(" connectMongoose :: fullMongoUrl: %s", fullMongoUrl);

  // Filter out options not supported by current mongoose version if necessary
  // But Mongoose 7+ might warn about deprecated options like useNewUrlParser
  // Keeping simple connect for now as per `server.ts` exampl or adapting `bootstrap.js` logic
  // `bootstrap.js` used: useNewUrlParser, useUnifiedTopology, autoIndex
  await mongoose.connect(fullMongoUrl, {
    // @ts-ignore - Mongoose 6+ types might complain about deprecated options but they are often still valid or ignored
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  } as any);
  logger.info("✅ Mongoose connected");

  // Mongoose is connected, now seed
  const db = mongoose.connection.db;

  // Initialize data in parallel
  await Promise.all([
    // @ts-ignore
    insertCourseCategories(db),
    // @ts-ignore
    insertBlogCategories(db),
    // @ts-ignore
    insertLanguages(db)
  ]);
  
  logger.info("✅ Course categories, blog categories, and languages inserted");

  // await createMongoIndex(db);
  // logger.info('✅ Mongo indexes created');

  // await createUserIndexOnLoad(db);
  // logger.info('✅ User indexes created');
}

function setupGracefulShutdown(server: http.Server) {
  const shutdown = async () => {
    logger.info("🔄 Shutting down gracefully...");
    try {
      server.close(async () => {
        try {
          await mongoose.disconnect();
          logger.info("✅ Mongoose connection closed");
          logger.info("✅ Process terminated");
          process.exit(0);
        } catch (error) {
          logger.error("❌ Error during Mongoose shutdown:", error);
          process.exit(1);
        }
      });
      setTimeout(() => {
        logger.error("❌ Forced shutdown due to timeout");
        process.exit(1);
      }, 10000);
    } catch (error) {
      logger.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
  process.on("uncaughtException", (error) => {
    logger.error("❌ Uncaught Exception:", error);
    shutdown();
  });
  process.on("unhandledRejection", (reason, promise) => {
    logger.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    shutdown();
  });
}
