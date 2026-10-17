import { Metadata } from '@grpc/grpc-js';

/**
 * Metadata gRPC cho lời gọi không có user (public endpoints / system jobs).
 * Đọc INTERNAL_TOKEN tại thời điểm gọi; fail-fast nếu thiếu, không fallback.
 */
export function getInternalGrpcMetadata(): Metadata {
  const token = process.env.INTERNAL_TOKEN;
  if (!token) {
    throw new Error('INTERNAL_TOKEN env is required');
  }
  const meta = new Metadata();
  meta.set('x-internal-token', token);
  return meta;
}

/** Header HTTP nội bộ cho REST call sang service khác (vd. notification-service). */
export function getInternalHttpHeaders(): Record<string, string> {
  const token = process.env.INTERNAL_TOKEN;
  if (!token) {
    throw new Error('INTERNAL_TOKEN env is required');
  }
  return { 'x-internal-token': token };
}
