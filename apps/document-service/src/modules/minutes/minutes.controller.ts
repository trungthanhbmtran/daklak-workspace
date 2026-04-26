import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MinutesService } from './minutes.service';

@Controller()
export class MinutesController {
  constructor(private readonly minutesService: MinutesService) {}

  @GrpcMethod('MinutesService', 'CreateMinutes')
  createMinutes(data: any) {
    return this.minutesService.create(data);
  }

  @GrpcMethod('MinutesService', 'GetMinutes')
  getMinutes(data: { id: string }) {
    return this.minutesService.findOne(data.id);
  }

  @GrpcMethod('MinutesService', 'ListMinutes')
  listMinutes(data: any) {
    return this.minutesService.findAll(data);
  }

  @GrpcMethod('MinutesService', 'UpdateMinutes')
  updateMinutes(data: any) {
    return this.minutesService.update(data.id, data);
  }

  @GrpcMethod('MinutesService', 'DeleteMinutes')
  deleteMinutes(data: { id: string }) {
    return this.minutesService.remove(data.id);
  }
}
