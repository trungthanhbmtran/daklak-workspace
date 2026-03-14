const dotenv = require('dotenv');

dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  
  server: {
    port: parseInt(process.env.PORT || '50060', 10),
    host: process.env.HOST || '0.0.0.0',
  },

  database: {
    host: process.env.DB_HOST || 'app-mysql',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'mypassword',
    database: process.env.DB_NAME || 'admin_posts',
    dialect: 'mysql',
    logging: process.env.NODE_ENV !== 'production',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://host.docker.internal:6379',
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10)
  },

  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://host.docker.internal:5672',
    queues: {
      postUpdates: 'post_updates'
    },
    exchanges: {
      postEvents: 'post_events'
    }
  },

  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://host.docker.internal:9200',
    auth: {
      username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
      password: process.env.ELASTICSEARCH_PASSWORD || ''
    }
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    tokenExpiration: '24h'
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json'
  }
};

module.exports = config;

