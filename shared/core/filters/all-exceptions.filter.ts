import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

/**
 * Map mã gRPC status (số) → HTTP statusCode + code chuỗi chuẩn hóa.
 * Dùng chung cho: (a) RpcException có `code` là số, (b) exception thô có field `code`.
 * (3→400, 4→503, 5→404, 6→409, 7→403, 8→429, 9→409, 12→501, 13→500, 14→503, 16→401)
 */
const GRPC_STATUS_HTTP_MAP: Record<number, { statusCode: number; code: string }> = {
  3: { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_ARGUMENT' },
  4: { statusCode: HttpStatus.SERVICE_UNAVAILABLE, code: 'DEADLINE_EXCEEDED' },
  5: { statusCode: HttpStatus.NOT_FOUND, code: 'NOT_FOUND' },
  6: { statusCode: HttpStatus.CONFLICT, code: 'ALREADY_EXISTS' },
  7: { statusCode: HttpStatus.FORBIDDEN, code: 'PERMISSION_DENIED' },
  8: { statusCode: HttpStatus.TOO_MANY_REQUESTS, code: 'RESOURCE_EXHAUSTED' },
  9: { statusCode: HttpStatus.CONFLICT, code: 'FAILED_PRECONDITION' },
  12: { statusCode: HttpStatus.NOT_IMPLEMENTED, code: 'UNIMPLEMENTED' },
  13: { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, code: 'INTERNAL' },
  14: { statusCode: HttpStatus.SERVICE_UNAVAILABLE, code: 'UNAVAILABLE' },
  16: { statusCode: HttpStatus.UNAUTHORIZED, code: 'UNAUTHENTICATED' },
};

/**
 * Chuẩn hoá toàn bộ lỗi về dạng duy nhất.
 * - Loại bỏ các trường null/undefined (như data: null, meta: null).
 * - Xử lý cho cả HTTP Context (API Gateway) và RPC Context (Microservices).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const contextType = host.getType();
    const timestamp = new Date().toISOString();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message: string | string[] =
      exception?.details ?? exception?.message ?? 'Internal server error';

    // 1. Map Exception to Status and Code
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      code = exception.constructor.name;
      const httpRes = exception.getResponse() as any;
      if (typeof httpRes === 'object' && httpRes !== null) {
        message = httpRes.message ?? message;
      } else if (typeof httpRes === 'string') {
        message = httpRes;
      }
    } else if (exception instanceof RpcException) {
      const err = exception.getError() as any;
      if (typeof err === 'object' && err !== null) {
        // err.code là mã gRPC status (số) → map sang HTTP theo bảng chuẩn,
        // tránh trả statusCode nonsense (ví dụ 5) cho client HTTP.
        const grpcMapped =
          typeof err.code === 'number' ? GRPC_STATUS_HTTP_MAP[err.code] : undefined;
        statusCode = err.statusCode ?? grpcMapped?.statusCode ?? statusCode;
        code = grpcMapped?.code ?? err.code ?? 'RPC_ERROR';
        message = err.message ?? message;
      } else if (typeof err === 'string') {
        message = err;
        code = 'RPC_ERROR';
      }
    } else if (exception?.code) {
      // Map gRPC status code (số) từ exception thô theo bảng chuẩn hóa
      const grpcCode = Number(exception.code);
      const grpcMapped = GRPC_STATUS_HTTP_MAP[grpcCode];
      if (grpcMapped) {
        statusCode = grpcMapped.statusCode;
        code = grpcMapped.code;
      } else {
        code =
          Number.isNaN(grpcCode) && typeof exception.code === 'string'
            ? exception.code
            : 'UNKNOWN_ERROR';
      }
    }

    const finalMessage = Array.isArray(message) ? message.join('; ') : String(message);

    this.logger.error(
      `[${code}] ${finalMessage}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // errorType: định danh kiểu lỗi để Frontend render đúng UI
    // Frontend KHÔNG được dùng statusCode để đoán, phải dùng errorType này
    const errorType = this.resolveErrorType(statusCode, code);

    const errorPayload = {
      success: false,
      message: finalMessage,
      errorType,  // Frontend render dựa vào field này
      code,
      statusCode,
      timestamp,
    };

    // 2. Trả về đúng context
    if (contextType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      
      // Some underlying platform (like express)
      if (response && typeof response.status === 'function') {
         response.status(statusCode).json(errorPayload);
      }
      return;
    } 
    
    if (contextType === 'rpc') {
      // For RMQ/gRPC, we throw an RpcException so the caller (Gateway) can catch it
      return throwError(() => new RpcException(errorPayload));
    }
  }

  /**
   * Ánh xạ statusCode + code → errorType chuẩn hóa.
   * Frontend chỉ cần đọc errorType, KHÔNG tự phân loại bằng statusCode.
   */
  private resolveErrorType(statusCode: number, code: string): string {
    // Ưu tiên code cụ thể
    switch (code) {
      case 'UNAUTHENTICATED':
      case 'UnauthorizedException':
        return 'AUTH_FAILED';
      case 'RATE_LIMITED':
        return 'RATE_LIMITED';
      case 'IP_BLOCKED':
        return 'IP_BLOCKED';
      case 'PERMISSION_DENIED':
      case 'ForbiddenException':
        return 'FORBIDDEN';
      case 'NOT_FOUND':
      case 'NotFoundException':
        return 'NOT_FOUND';
      case 'ALREADY_EXISTS':
      case 'ConflictException':
        return 'CONFLICT';
      case 'BadRequestException':
      case 'INVALID_ARGUMENT':
        return 'VALIDATION_ERROR';
      case 'RESOURCE_EXHAUSTED':
        return 'RATE_LIMITED';
    }
    // Fallback theo statusCode
    switch (statusCode) {
      case 400: return 'VALIDATION_ERROR';
      case 401: return 'AUTH_FAILED';
      case 403: return 'FORBIDDEN';
      case 404: return 'NOT_FOUND';
      case 409: return 'CONFLICT';
      case 429: return 'RATE_LIMITED';
      case 503: return 'SERVICE_UNAVAILABLE';
      default: return 'INTERNAL_ERROR';
    }
  }
}

