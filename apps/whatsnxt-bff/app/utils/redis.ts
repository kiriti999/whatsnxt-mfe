import Redis from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;

let redisClient;

try {
  const redisUrl = `redis://${REDIS_HOST}:${REDIS_PORT}`;
  redisClient = new Redis(redisUrl);
  console.log("🚀 ~ redisUrl:", redisUrl);
} catch (error) {
  console.log("redis.js:: error: ", error);
}

export { redisClient };
