import { Catch, RpcExceptionFilter, ArgumentsHost, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class GlobalRpcExceptionFilter implements RpcExceptionFilter<RpcException> {
  private readonly logger = new Logger(GlobalRpcExceptionFilter.name);

  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    this.logger.error(`gRPC Error: ${JSON.stringify(exception.getError())}`);
    return throwError(() => exception.getError());
  }
}
