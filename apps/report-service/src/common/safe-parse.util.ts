import { RpcException } from '@nestjs/microservices';

/**
 * Ledger #26: parse JSON payload gRPC an toàn.
 * Lỗi parse ném RpcException INVALID_ARGUMENT (gRPC code 3) thay vì để SyntaxError
 * nguyên thủy văng ra crash handler / trả INTERNAL.
 */
export function safeParse<T = any>(
  json: string | undefined | null,
  message = 'Payload không phải JSON hợp lệ',
): T {
  try {
    return JSON.parse(json || '{}') as T;
  } catch {
    throw new RpcException({ code: 3, message });
  }
}
