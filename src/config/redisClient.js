const redis = require('redis');
const config = require('./config');
const logger = require('./logger');

const redisClient = redis.createClient({
    url: config.redis.url
});

redisClient.on('error', (err) => {
    logger.error('Redis Client Error', err);
});

(async () => {
    await redisClient.connect();
    logger.info('Connected to Redis');
})();


module.exports = redisClient;