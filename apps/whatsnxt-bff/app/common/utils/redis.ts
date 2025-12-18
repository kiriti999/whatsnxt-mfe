import Redis from "ioredis";
import { getLogger } from "../../../config/logger";

const logger = getLogger("redis");

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || "6379";

let redisClient: Redis;

try {
  const redisUrl = `redis://${REDIS_HOST}:${REDIS_PORT}`;
  redisClient = new Redis(redisUrl);
  logger.info("🚀 ~ redisUrl:", redisUrl);
} catch (error) {
  logger.error("redis.ts:: error: ", error);
  // Create a dummy client to prevent crashes
  redisClient = new Redis({ lazyConnect: true });
}

export { redisClient };
