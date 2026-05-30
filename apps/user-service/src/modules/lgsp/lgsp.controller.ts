import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { LgspService } from './lgsp.service';

@Controller()
export class LgspController {
  constructor(private readonly lgspService: LgspService) {}

  @GrpcMethod('LgspService', 'SyncDocuments')
  async syncDocuments(data: any) {
    return this.lgspService.syncDocuments(data);
  }

  @GrpcMethod('LgspService', 'SendDocument')
  async sendDocument(data: any) {
    return this.lgspService.sendDocument(data);
  }
}
