const grpc = require('@grpc/grpc-js');
const { logger }= require('../utils/logger');

const errorMiddleware = (error, call) => {
  console.log("error",call)
  const metadata = call.metadata.getMap();
  const context = {
    method: call.getMethod(),
    userId: metadata.userId,
    requestId: metadata.requestId
  };

  logger.error('gRPC Error:', { error, context });

  if (error.code === 'VALIDATION_ERROR') {
    return {
      code: grpc.status.INVALID_ARGUMENT,
      message: error.message
    };
  }

  if (error.code === 'NOT_FOUND') {
    return {
      code: grpc.status.NOT_FOUND,
      message: error.message
    };
  }

  return {
    code: grpc.status.INTERNAL,
    message: 'Internal server error'
  };
};

module.exports ={
  errorMiddleware
}