import {
  Catch,
  RpcExceptionFilter,
  ArgumentsHost,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Catch()
export class GlobalRpcExceptionFilter implements RpcExceptionFilter<RpcException> {
  private readonly logger = new Logger('GlobalRpcExceptionFilter');

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    const errorResponse = {
      code: exception.code || status.INTERNAL,
      message: exception.message || 'Internal server error',
      details: exception.details || exception.message || '',
    };

    // Log the full error to the console for debugging
    this.logger.error(`gRPC Error: [${errorResponse.code}] ${errorResponse.message}`, exception.stack);

    return throwError(() => errorResponse);
  }
}
