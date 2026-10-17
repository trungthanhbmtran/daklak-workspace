import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom, timeout, catchError, EMPTY } from 'rxjs';

export const WORKFLOW_RMQ_CLIENT = 'WORKFLOW_RMQ_CLIENT';

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(
    @Inject(WORKFLOW_RMQ_CLIENT) private readonly client: ClientProxy,
  ) {}

  /**
   * [P2 #28] Fire-and-forget emit: tự subscribe để message thực sự được
   * publish vào broker (ClientProxy.emit là cold observable — trước đây caller bỏ qua return
   * nên message không bao giờ rời service), và lỗi broker được Logger.error thay vì nuốt vô hình.
   * Dùng cho event không phản hồi; publisher chính tắc vẫn là `publish()` (OutboxPublisher).
   */
  public emit(pattern: string, data: any): void {
    this.client
      .emit(pattern, data)
      .pipe(
        catchError((err: any) => {
          this.logger.error(`RMQ emit '${pattern}' failed: ${err?.message ?? err}`);
          return EMPTY;
        }),
      )
      .subscribe();
  }

  /**
   * Publish có xác nhận: resolve khi client đã dispatch xong, reject khi lỗi/timeout.
   * Dùng cho OutboxPublisher — chỉ đánh dấu PUBLISHED sau khi promise này resolve.
   */
  public async publish(pattern: string, data: any, timeoutMs = 5000): Promise<void> {
    await lastValueFrom(this.client.emit(pattern, data).pipe(timeout(timeoutMs)), {
      defaultValue: undefined,
    });
  }

  public async sendAsync(pattern: string, data: any): Promise<any> {
    return firstValueFrom(this.client.send(pattern, data));
  }
}
