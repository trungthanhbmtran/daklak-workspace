import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { KpisService } from './kpis.service';

@Controller()
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @GrpcMethod('KpiService', 'FindPeriods')
  async findPeriods() {
    const periods = await this.kpisService.findPeriods();
    return {
      periods: periods.map(p => ({
        ...p,
        startDate: p.startDate.toISOString(),
        endDate: p.endDate.toISOString()
      }))
    };
  }

  @GrpcMethod('KpiService', 'CreatePeriod')
  async createPeriod(data: { name: string; startDate: string; endDate: string }) {
    const p = await this.kpisService.createPeriod({
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
    return {
      ...p,
      startDate: p.startDate.toISOString(),
      endDate: p.endDate.toISOString()
    };
  }

  @GrpcMethod('KpiService', 'FindCriteria')
  async findCriteria() {
    const criteria = await this.kpisService.findCriteria();
    return { criteria };
  }

  @GrpcMethod('KpiService', 'CreateCriterion')
  async createCriterion(data: any) {
    const criterion = await this.kpisService.createCriterion(data);
    return criterion;
  }

  @GrpcMethod('KpiService', 'UpdateCriterion')
  async updateCriterion(data: any) {
    const { id, ...updateData } = data;
    const criterion = await this.kpisService.updateCriterion(id, updateData);
    return criterion;
  }

  @GrpcMethod('KpiService', 'DeleteCriterion')
  async deleteCriterion(data: { id: number }) {
    await this.kpisService.deleteCriterion(data.id);
    return { success: true };
  }

  @GrpcMethod('KpiService', 'CreateEvaluation')
  async createEvaluation(data: {
    employeeCode: string;
    periodId: number;
    details: { criteriaId: number; selfScore: number; notes?: string }[];
  }) {
    const e = await this.kpisService.createEvaluation(data);
    return e;
  }

  @GrpcMethod('KpiService', 'FindEvaluations')
  async findEvaluations(data: { employeeCode: string }) {
    if (!data.employeeCode) return { evaluations: [] };
    const evals = await this.kpisService.findEvaluationsByEmployee(data.employeeCode);
    return { evaluations: evals };
  }
}
