import { logger } from '../config/logger';

export const LogUtils = {
  // Database logging
  logDatabaseQuery: (query: string, parameters: any[], duration: number) => {
    logger.debug({
      type: 'database_query',
      query,
      parameters,
      duration
    });
  },

  // Cache logging
  logCacheOperation: (operation: string, key: string, duration: number, hit?: boolean) => {
    logger.debug({
      type: 'cache_operation',
      operation,
      key,
      duration,
      hit
    });
  },

  // Queue logging
  logQueueEvent: (exchange: string, routingKey: string, payload: any) => {
    logger.info({
      type: 'queue_event',
      exchange,
      routingKey,
      payload
    });
  },

  // Error logging with context
  logError: (error: Error, context: any = {}) => {
    logger.error({
      type: 'error',
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context
    });
  },

  // Performance logging
  logPerformance: (operation: string, duration: number, metadata: any = {}) => {
    logger.info({
      type: 'performance',
      operation,
      duration,
      ...metadata
    });
  }
};

