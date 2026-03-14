const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const logDir = 'logs';
const errorLog = path.join(logDir, 'error');
const combinedLog = path.join(logDir, 'combined');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'grpc-service' },
  transports: [
    // Error log
    new winston.transports.DailyRotateFile({
      filename: `${errorLog}/%DATE%-error.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
    }),
    
    // Combined log
    new winston.transports.DailyRotateFile({
      filename: `${combinedLog}/%DATE%-combined.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

// Add console transport in non-production
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

module.exports = { logger };

