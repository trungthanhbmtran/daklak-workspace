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
        statusCode = err.statusCode ?? err.code ?? statusCode;
        code = err.code ?? 'RPC_ERROR';
        message = err.message ?? message;
      } else if (typeof err === 'string') {
        message = err;
        code = 'RPC_ERROR';
      }
    } else if (exception?.code) {
      // Map gRPC or other codes
      const grpcCode = Number(exception.code);
      switch (grpcCode) {
        case 3: // INVALID_ARGUMENT
          statusCode = HttpStatus.BAD_REQUEST;
          code = 'INVALID_ARGUMENT';
          break;
        case 5: // NOT_FOUND
          statusCode = HttpStatus.NOT_FOUND;
          code = 'NOT_FOUND';
          break;
        case 6: // ALREADY_EXISTS
          statusCode = HttpStatus.CONFLICT;
          code = 'ALREADY_EXISTS';
          break;
        case 7: // PERMISSION_DENIED
          statusCode = HttpStatus.FORBIDDEN;
          code = 'PERMISSION_DENIED';
          break;
        case 16: // UNAUTHENTICATED
          statusCode = HttpStatus.UNAUTHORIZED;
          code = 'UNAUTHENTICATED';
          break;
        case 12: // UNIMPLEMENTED
          statusCode = HttpStatus.NOT_IMPLEMENTED;
          code = 'UNIMPLEMENTED';
          break;
        case 8: // RESOURCE_EXHAUSTED
          statusCode = HttpStatus.TOO_MANY_REQUESTS;
          code = 'RESOURCE_EXHAUSTED';
          break;
        default:
          code = typeof exception.code === 'string' ? exception.code : 'UNKNOWN_ERROR';
          break;
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

