import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Nếu đã là HttpException thì giữ nguyên
    if (exception instanceof HttpException) {
      return response.status(exception.getStatus()).json(exception.getResponse());
    }

    // Map gRPC code sang HTTP status
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.details || exception.message || 'Internal server error';

    // Log the full exception for debugging
    this.logger.error(`gRPC Error caught: [${exception.code}] ${message}`, exception.stack);

    switch (exception.code) {
      case GrpcStatus.INVALID_ARGUMENT:
        status = HttpStatus.BAD_REQUEST;
        break;
      case GrpcStatus.NOT_FOUND:
        status = HttpStatus.NOT_FOUND;
        break;
      case GrpcStatus.ALREADY_EXISTS:
        status = HttpStatus.CONFLICT;
        break;
      case GrpcStatus.PERMISSION_DENIED:
        status = HttpStatus.FORBIDDEN;
        break;
      case GrpcStatus.UNAUTHENTICATED:
        status = HttpStatus.UNAUTHORIZED;
        break;
      case GrpcStatus.UNIMPLEMENTED:
        status = HttpStatus.NOT_IMPLEMENTED;
        break;
      case GrpcStatus.RESOURCE_EXHAUSTED:
        status = HttpStatus.TOO_MANY_REQUESTS;
        break;
    }

    response.status(status).json({
      success: false,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
