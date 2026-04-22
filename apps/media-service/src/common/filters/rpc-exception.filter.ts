import { Catch, RpcExceptionFilter, ArgumentsHost, Logger, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Catch()
export class GlobalRpcExceptionFilter implements RpcExceptionFilter {
  private readonly logger = new Logger(GlobalRpcExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    let code = status.INTERNAL;
    let message = 'Internal server error';

    if (exception instanceof RpcException) {
      const error = exception.getError() as any;
      code = error.code || status.INTERNAL;
      message = error.message || message;
    } else {
      // Handle standard NestJS exceptions or generic Errors
      const status_code = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || message;

      if (status_code === HttpStatus.NOT_FOUND) {
        code = status.NOT_FOUND;
      } else if (status_code === HttpStatus.BAD_REQUEST) {
        code = status.INVALID_ARGUMENT;
      }
    }

    this.logger.error(`[gRPC Error] Code: ${code} | Message: ${message}`);
    if (exception.stack) {
      this.logger.error(exception.stack);
    }

    return throwError(() => ({
      code,
      message,
    }));
  }
}
