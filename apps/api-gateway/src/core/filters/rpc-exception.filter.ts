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

/**
 * Chuẩn hoá toàn bộ lỗi về dạng duy nhất:
 * {
 *   success: false,
 *   data: null,
 *   meta: null,
 *   message: string,
 *   code: string,
 *   statusCode: number,
 *   timestamp: string,
 * }
 */
@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const timestamp = new Date().toISOString();

    // HttpException (NestJS built-in)
    if (exception instanceof HttpException) {
      const httpRes = exception.getResponse() as any;
      const message =
        typeof httpRes === 'string'
          ? httpRes
          : (httpRes?.message ?? exception.message);
      return response.status(exception.getStatus()).json({
        success: false,
        data: null,
        meta: null,
        message: Array.isArray(message) ? message.join('; ') : String(message),
        code: exception.constructor.name,
        statusCode: exception.getStatus(),
        timestamp,
      });
    }

    // gRPC RpcException — map code → HTTP status
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    const message =
      exception?.details ?? exception?.message ?? 'Internal server error';

    this.logger.error(
      `[${exception?.code ?? 'UNKNOWN'}] ${message}`,
      exception?.stack,
    );

    switch (exception?.code) {
      case GrpcStatus.INVALID_ARGUMENT:
        statusCode = HttpStatus.BAD_REQUEST;
        code = 'INVALID_ARGUMENT';
        break;
      case GrpcStatus.NOT_FOUND:
        statusCode = HttpStatus.NOT_FOUND;
        code = 'NOT_FOUND';
        break;
      case GrpcStatus.ALREADY_EXISTS:
        statusCode = HttpStatus.CONFLICT;
        code = 'ALREADY_EXISTS';
        break;
      case GrpcStatus.PERMISSION_DENIED:
        statusCode = HttpStatus.FORBIDDEN;
        code = 'PERMISSION_DENIED';
        break;
      case GrpcStatus.UNAUTHENTICATED:
        statusCode = HttpStatus.UNAUTHORIZED;
        code = 'UNAUTHENTICATED';
        break;
      case GrpcStatus.UNIMPLEMENTED:
        statusCode = HttpStatus.NOT_IMPLEMENTED;
        code = 'UNIMPLEMENTED';
        break;
      case GrpcStatus.RESOURCE_EXHAUSTED:
        statusCode = HttpStatus.TOO_MANY_REQUESTS;
        code = 'RESOURCE_EXHAUSTED';
        break;
    }

    response.status(statusCode).json({
      success: false,
      data: null,
      meta: null,
      message: String(message),
      code,
      statusCode,
      timestamp,
    });
  }
}
