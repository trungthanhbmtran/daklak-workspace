const { Sequelize } = require('sequelize');
const config = require('../config');

class DatabaseManager {
  constructor() {
    this.sequelize = null;
    this.isConnected = false;
    this.connectionPool = new Map();
  }

  /**
   * Initialize database connection with connection pooling
   */
  async initialize() {
    try {
      console.log('🔄 Initializing database connection...');
      
      this.sequelize = new Sequelize({
        host: config.database.host,
        port: config.database.port,
        username: config.database.username,
        password: config.database.password,
        database: config.database.database,
        dialect: config.database.dialect,
        logging: config.database.logging ? console.log : false,
        pool: {
          max: config.database.pool.max,
          min: config.database.pool.min,
          acquire: config.database.pool.acquire,
          idle: config.database.pool.idle,
          evict: 60000, // Run eviction every minute
        },
        retry: {
          max: 3,
          timeout: 5000,
        },
        dialectOptions: {
          connectTimeout: 60000,
          acquireTimeout: 60000,
          timeout: 60000,
          dateStrings: true,
          typeCast: true,
        },
        define: {
          timestamps: true,
          underscored: true,
          freezeTableName: true,
        },
      });

      // Test connection
      await this.sequelize.authenticate();
      this.isConnected = true;
      
      console.log('✅ Database connection established');
      
      // Log connection info
      console.log('📋 Database Information:', {
        host: config.database.host,
        port: config.database.port,
        database: config.database.database,
        dialect: config.database.dialect,
        poolSize: config.database.pool.max
      });
      
      return this.sequelize;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw new Error(`Database initialization failed: ${error.message}`);
    }
  }

  /**
   * Get database connection
   */
  getConnection() {
    if (!this.sequelize || !this.isConnected) {
      throw new Error('Database not initialized');
    }
    return this.sequelize;
  }

  /**
   * Execute database transaction
   * @param {Function} callback - Transaction callback
   * @param {Object} options - Transaction options
   */
  async transaction(callback, options = {}) {
    const connection = this.getConnection();
    
    const transactionOptions = {
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
      ...options
    };

    try {
      const result = await connection.transaction(transactionOptions, callback);
      return result;
    } catch (error) {
      console.error('❌ Transaction failed:', error.message);
      throw error;
    }
  }

  /**
   * Execute raw query with connection pooling
   * @param {string} query - SQL query
   * @param {Object} options - Query options
   */
  async query(query, options = {}) {
    const connection = this.getConnection();
    
    try {
      const [results, metadata] = await connection.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        ...options
      });
      
      return { results, metadata };
    } catch (error) {
      console.error('❌ Query failed:', error.message);
      throw error;
    }
  }

  /**
   * Health check for database
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected', message: 'Database not connected' };
      }

      await this.sequelize.authenticate();
      return { status: 'healthy', message: 'Database connection is healthy' };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        message: `Database health check failed: ${error.message}` 
      };
    }
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      const connection = this.getConnection();
      const pool = connection.connectionManager.pool;
      
      return {
        totalConnections: pool.size,
        idleConnections: pool.idle,
        activeConnections: pool.length - pool.idle,
        waitingConnections: pool.pending,
        maxConnections: pool.config.max,
        minConnections: pool.config.min
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Gracefully close database connection
   */
  async close() {
    try {
      if (this.sequelize && this.isConnected) {
        console.log('🔄 Closing database connections...');
        
        // Close all connections in pool
        await this.sequelize.close();
        this.isConnected = false;
        
        console.log('✅ Database connections closed');
      }
    } catch (error) {
      console.error('❌ Error closing database connections:', error.message);
      throw error;
    }
  }

  /**
   * Force close all connections (emergency shutdown)
   */
  async forceClose() {
    try {
      if (this.sequelize) {
        console.log('🔄 Force closing database connections...');
        
        // Force close without waiting for active connections
        await this.sequelize.close({ force: true });
        this.isConnected = false;
        
        console.log('✅ Database connections force closed');
      }
    } catch (error) {
      console.error('❌ Error force closing database connections:', error.message);
    }
  }
}

// Singleton instance
const databaseManager = new DatabaseManager();

module.exports = databaseManager; 