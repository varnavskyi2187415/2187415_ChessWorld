import { createClient, RedisClientType } from '@redis/client';

let redisClient: RedisClientType;

export async function connectRedis(): Promise<void> {
    try {
        console.log(`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
        redisClient = createClient({
            url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
        });

        redisClient.on('error', (err: Error) => {
            console.error('Redis Client Error', err);
        });

        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (error) {
        console.error('Error connecting to Redis:', error);
        throw error;
    }
}

export function getRedisClient(): RedisClientType {
    if (!redisClient) {
        throw new Error('Redis client is not initialized. Call connectRedis first.');
    }
    return redisClient;
}
