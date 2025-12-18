// ========================================
// REDIS SERVICE
// ========================================
import Redis from "ioredis";
import pako from "pako";
import { getLogger } from "../../config/logger";
const logger = getLogger("redisService");

class RedisService {
  private client: Redis | null;
  private isConnected: boolean;

  constructor() {
    this.client = null;
    this.isConnected = false;
    this.initializeRedis();
  }

  initializeRedis() {
    try {
      const redisConfig: any = {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT) || 6379,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
      };

      // Add auth if provided
      if (process.env.REDIS_PASSWORD) {
        redisConfig.password = process.env.REDIS_PASSWORD;
      }

      // @ts-ignore
      this.client = new Redis(redisConfig);

      this.client.on("connect", () => {
        logger.info("RedisService :: Connected to Redis");
        this.isConnected = true;
      });

      this.client.on("error", (error) => {
        logger.error("RedisService :: Redis connection error:", error);
        this.isConnected = false;
      });

      this.client.on("close", () => {
        logger.info("RedisService :: Redis connection closed");
        this.isConnected = false;
      });
    } catch (error) {
      logger.error("RedisService :: Failed to initialize Redis:", error);
    }
  }

  async get(key) {
    try {
      if (!this.isConnected || !this.client) {
        logger.warn("RedisService :: get :: Redis not connected");
        return null;
      }

      const value = await this.client.get(key);
      if (!value) return null;

      // Decompress and parse JSON using pako
      const compressedBuffer = Buffer.from(value, "base64");
      const decompressed = pako.inflate(compressedBuffer, { to: "string" });
      return JSON.parse(decompressed);
    } catch (error) {
      logger.error(
        `RedisService :: get :: Error parsing JSON for key ${key}:`,
        error,
      );
      return null;
    }
  }

  async set(key, value, ttl) {
    try {
      if (!this.isConnected || !this.client) {
        logger.warn("RedisService :: set :: Redis not connected");
        return false;
      }

      // Compress and stringify using pako
      const jsonString = JSON.stringify(value);
      const compressed = pako.deflate(jsonString);
      const compressedValue = Buffer.from(compressed).toString("base64");

      if (ttl) {
        await this.client.setex(key, ttl, compressedValue);
      } else {
        await this.client.set(key, compressedValue);
      }

      return true;
    } catch (error) {
      logger.error(`RedisService :: set :: Error setting key ${key}:`, error);
      return false;
    }
  }

  async remove(key) {
    try {
      if (!this.isConnected || !this.client) {
        logger.warn("RedisService :: remove :: Redis not connected");
        return 0;
      }

      return await this.client.del(key);
    } catch (error) {
      logger.error(
        `RedisService :: remove :: Error removing key ${key}:`,
        error,
      );
      return 0;
    }
  }

  async purgeByPattern(pattern) {
    try {
      if (!this.isConnected || !this.client) {
        logger.warn("RedisService :: purgeByPattern :: Redis not connected");
        return;
      }

      const stream = this.client.scanStream({
        match: pattern,
        count: 100,
      });

      const keysToDelete = [];

      return new Promise<void>((resolve, reject) => {
        stream.on("data", (keys) => {
          if (keys.length > 0) {
            keysToDelete.push(...keys);
          }
        });

        stream.on("end", async () => {
          try {
            if (keysToDelete.length > 0) {
              logger.info(
                `RedisService :: purgeByPattern :: Deleting ${keysToDelete.length} keys matching pattern: ${pattern}`,
              );
              await this.client.del(...keysToDelete);
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        });

        stream.on("error", reject);
      });
    } catch (error) {
      logger.error(
        `RedisService :: purgeByPattern :: Error purging pattern ${pattern}:`,
        error,
      );
      throw error;
    }
  }

  async exists(key) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(
        `RedisService :: exists :: Error checking key ${key}:`,
        error,
      );
      return false;
    }
  }

  async expire(key, seconds) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      logger.error(
        `RedisService :: expire :: Error setting expiry for key ${key}:`,
        error,
      );
      return false;
    }
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.disconnect();
        logger.info("RedisService :: Disconnected from Redis");
      }
    } catch (error) {
      logger.error("RedisService :: Error disconnecting from Redis:", error);
    }
  }

  getServiceInfo() {
    return {
      service: "RedisService",
      connected: this.isConnected,
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      compression: "pako/deflate",
      features: ["get", "set", "remove", "purgeByPattern", "exists", "expire"],
    };
  }
}

// Create singleton instances
const redisService = new RedisService();

export { redisService };
