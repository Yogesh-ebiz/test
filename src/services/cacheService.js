const redisClient = require('../config/redisClient');
const config = require('../config/config')

async function getFromCache(key) {
    try {
        const data = await redisClient.get(key);
        return data;
    } catch (error) {
        console.error('Failed to retrieve from cache', error);
        return null;
    }
}

async function saveToCache(key, value) {
    let expireTime = config.redis.ttl;
    try {
        // Serializing object data to string for storage
        const stringValue = JSON.stringify(value);
        await redisClient.set(key, stringValue, 'EX', expireTime);
    } catch (error) {
        console.error('Failed to save to cache', error);
    }
}

async function deleteFromCache(key) {
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error('Failed to delete from cache', error);
    }
}

module.exports = {
    getFromCache,
    saveToCache,
    deleteFromCache
};