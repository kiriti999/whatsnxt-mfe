// server.ts - Clean entry point
import "dotenv/config";
import { bootstrap } from "./config/bootstrap";
// import { getLogger } from './config/logger';
const { getLogger } = require("./config/logger");

const logger = getLogger("server");

// Start the application
bootstrap().catch((error) => {
  logger.error("Failed to start application:", error);
  process.exit(1);
});

// That's it! Clean and simple.
