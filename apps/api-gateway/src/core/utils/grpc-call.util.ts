import { firstValueFrom, Observable, timeout } from 'rxjs';
import { GatewayTimeoutException } from '@nestjs/common';

/**
 * Bọc cuộc gọi gRPC Observable với timeout/deadline tự động.
 * Ngăn chặn hiện tượng nghẽn cascading failure khi microservice hạ tầng bị treo hoặc timeout.
 *
 * @param call$ Observable trả về từ NestJS gRPC client
 * @param timeoutMs Thời gian timeout tối đa tính bằng mili-giây (mặc định 8000ms)
 * @param context Tên ngữ cảnh gọi API phục vụ logging và báo lỗi
 */
export async function executeGrpcCall<T>(
  call$: Observable<T>,
  timeoutMs = 8000,
  context = 'gRPC Call',
): Promise<T> {
  return firstValueFrom(
    call$.pipe(
      timeout({
        each: timeoutMs,
        with: () => {
          throw new GatewayTimeoutException(`${context} timed out sau ${timeoutMs}ms`);
        },
      }),
    ),
  );
}
