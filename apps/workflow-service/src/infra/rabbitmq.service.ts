import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom, timeout } from 'rxjs';

export const WORKFLOW_RMQ_CLIENT = 'WORKFLOW_RMQ_CLIENT';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject(WORKFLOW_RMQ_CLIENT) private readonly client: ClientProxy,
  ) {}

  public emit(pattern: string, data: any) {
    return this.client.emit(pattern, data);
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
