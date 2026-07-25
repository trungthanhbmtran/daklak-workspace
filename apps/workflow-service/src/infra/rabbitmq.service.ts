import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export const WORKFLOW_RMQ_CLIENT = 'WORKFLOW_RMQ_CLIENT';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject(WORKFLOW_RMQ_CLIENT) private readonly client: ClientProxy,
  ) {}

  public emit(pattern: string, data: any) {
    return this.client.emit(pattern, data);
  }

  public async sendAsync(pattern: string, data: any): Promise<any> {
    return firstValueFrom(this.client.send(pattern, data));
  }
}

