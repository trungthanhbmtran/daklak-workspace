import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const type = host.getType();

    if (type === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();

      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      const message =
        exception instanceof HttpException
          ? exception.getResponse()
          : exception instanceof Error
          ? exception.message
          : 'Internal server error';

      this.logger.error(
        `HTTP Error: ${request.method} ${request.url} - Status: ${status}`,
        exception instanceof Error ? exception.stack : '',
      );

      // Trả về JSON chuẩn hoá
      response.status(status).json({
        success: false,
        error: {
          code: status,
          message: typeof message === 'string' ? message : (message as any).message || message,
        },
      });
    } else if (type === 'rpc') {
      // Bắt lỗi gRPC
      this.logger.error(
        `RPC Error`,
        exception instanceof Error ? exception.stack : '',
      );
      // Ném lại lỗi RpcException cho NestJS handle về Gateway
      if (exception instanceof RpcException) {
        return exception;
      }
      return new RpcException(
        exception instanceof Error ? exception.message : 'RPC Internal error',
      );
    }
  }
}
