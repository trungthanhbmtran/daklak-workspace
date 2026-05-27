import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MasterPlansService } from './master-plans.service';

@Controller()
export class MasterPlansController {
  constructor(private readonly masterPlansService: MasterPlansService) {}

  @GrpcMethod('MasterPlanService', 'FindAll')
  findAll(data: any) {
    return this.masterPlansService.findAll(data);
  }

  @GrpcMethod('MasterPlanService', 'FindById')
  findById(data: { id: number }) {
    return this.masterPlansService.findById(data.id);
  }

  @GrpcMethod('MasterPlanService', 'Create')
  create(data: any) {
    return this.masterPlansService.create(data);
  }

  @GrpcMethod('MasterPlanService', 'Update')
  update(data: any) {
    return this.masterPlansService.update(data.id, data);
  }

  @GrpcMethod('MasterPlanService', 'Delete')
  delete(data: { id: number }) {
    return this.masterPlansService.delete(data.id);
  }
}
