import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { WORKFLOW_RMQ_CLIENT } from './rabbitmq.module';
import { firstValueFrom } from 'rxjs';

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
