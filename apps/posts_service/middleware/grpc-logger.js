const { v4: uuidv4 } = require('uuid');
const { logger } = require('../config/logger');

function createLoggingInterceptor() {
  return (call, methodDef, callback, next) => {
    const startTime = Date.now();
    const requestId = uuidv4();
    const method = methodDef.originalName;
    const service = methodDef.path.split('/')[1];

    // Log request
    logger.info({
      type: 'grpc_request',
      requestId,
      method,
      service,
      metadata: call.metadata.getMap(),
      request: call.request
    });

    // Create new callback that logs the response
    const wrappedCallback = (err, response) => {
      const duration = Date.now() - startTime;

      if (err) {
        logger.error({
          type: 'grpc_error',
          requestId,
          method,
          service,
          error: {
            code: err.code,
            message: err.message,
            details: err.details
          },
          duration
        });
      } else {
        logger.info({
          type: 'grpc_response',
          requestId,
          method,
          service,
          response,
          duration
        });
      }

      callback(err, response);
    };

    next(call, wrappedCallback);
  };
}

module.exports = { createLoggingInterceptor };

