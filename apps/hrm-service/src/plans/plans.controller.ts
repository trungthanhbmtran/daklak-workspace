import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PlansService } from './plans.service';

@Controller()
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @GrpcMethod('MasterPlanService', 'FindAll')
  async findAll(data: { type?: string; status?: string }) {
    const plans = await this.plansService.findAll(data);
    return {
      masterPlans: plans.map(p => this.mapToGrpc(p))
    };
  }

  @GrpcMethod('MasterPlanService', 'FindById')
  async findById(data: { id: number }) {
    const plan = await this.plansService.findById(data.id);
    return this.mapToGrpc(plan);
  }

  @GrpcMethod('MasterPlanService', 'Create')
  async create(data: any) {
    const plan = await this.plansService.create(data);
    return this.mapToGrpc(plan);
  }

  @GrpcMethod('MasterPlanService', 'Update')
  async update(data: any) {
    const plan = await this.plansService.update(data.id, data);
    return this.mapToGrpc(plan);
  }

  @GrpcMethod('MasterPlanService', 'Delete')
  async remove(data: { id: number }) {
    return this.plansService.remove(data.id);
  }

  private mapToGrpc(plan: any) {
    return {
      ...plan,
      startDate: plan.startDate ? plan.startDate.toISOString() : '',
      endDate: plan.endDate ? plan.endDate.toISOString() : '',
      createdAt: plan.createdAt ? plan.createdAt.toISOString() : '',
      updatedAt: plan.updatedAt ? plan.updatedAt.toISOString() : '',
      totalTasks: plan.totalTasks || 0,
      completedTasks: plan.completedTasks || 0,
      documentId: plan.documentId || ''
    };
  }
}
