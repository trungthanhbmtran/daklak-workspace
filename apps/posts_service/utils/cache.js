const Redis = require('ioredis');
const config = require('../config');

class CacheManager {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.defaultTTL = config.redis.ttl;
  }

  async initialize() {
    try {
      console.log('🔄 Initializing Redis connection...');
      
      this.redis = new Redis(config.redis.url, {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        family: 4,
        connectTimeout: 10000,
        commandTimeout: 5000,
        retryDelayOnClusterDown: 300,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        enableOfflineQueue: false,
      });

      // Event listeners
      this.redis.on('connect', () => {
        console.log('✅ Redis connected');
        this.isConnected = true;
      });

      this.redis.on('error', (error) => {
        console.error('❌ Redis error:', error.message);
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        console.log('🔌 Redis connection closed');
        this.isConnected = false;
      });

      // Test connection
      await this.redis.ping();
      
      console.log('📋 Redis Information:', {
        url: config.redis.url,
        ttl: this.defaultTTL
      });
      
      return this.redis;
    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
      throw new Error(`Redis initialization failed: ${error.message}`);
    }
  }

  async get(key) {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('❌ Redis get error:', error.message);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error('❌ Redis set error:', error.message);
      return false;
    }
  }

  async delete(key) {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('❌ Redis delete error:', error.message);
      return false;
    }
  }

  async close() {
    if (this.redis) {
      await this.redis.quit();
      this.isConnected = false;
    }
  }
}

const cacheManager = new CacheManager();
module.exports = cacheManager; 