import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { KpiEvaluationsService } from './kpi-evaluations.service';

@Controller()
export class KpiEvaluationsController {
  constructor(private readonly kpiEvaluationsService: KpiEvaluationsService) {}

  @GrpcMethod('KpiService', 'FindPeriods')
  findPeriods(data: any) {
    return this.kpiEvaluationsService.findPeriods();
  }

  @GrpcMethod('KpiService', 'CreatePeriod')
  createPeriod(data: any) {
    return this.kpiEvaluationsService.createPeriod(data);
  }

  @GrpcMethod('KpiService', 'FindCriteria')
  findCriteria(data: any) {
    return this.kpiEvaluationsService.findCriteria(data);
  }

  @GrpcMethod('KpiService', 'CreateCriterion')
  createCriterion(data: any) {
    return this.kpiEvaluationsService.createCriterion(data);
  }

  @GrpcMethod('KpiService', 'UpdateCriterion')
  updateCriterion(data: any) {
    return this.kpiEvaluationsService.updateCriterion(data.id, data);
  }

  @GrpcMethod('KpiService', 'DeleteCriterion')
  deleteCriterion(data: { id: number }) {
    return this.kpiEvaluationsService.deleteCriterion(data.id);
  }

  @GrpcMethod('KpiService', 'CreateEvaluation')
  createEvaluation(data: any) {
    return this.kpiEvaluationsService.createEvaluation(data);
  }

  @GrpcMethod('KpiService', 'FindEvaluations')
  findEvaluations(data: any) {
    return this.kpiEvaluationsService.findEvaluations(data);
  }

  @GrpcMethod('KpiService', 'GetEvaluationStats')
  getEvaluationStats(data: any) {
    return this.kpiEvaluationsService.getEvaluationStats(data);
  }

  @GrpcMethod('KpiService', 'CalculatePersonalKpi')
  calculatePersonalKpi(data: { periodId: number, employeeCode: string }) {
    return this.kpiEvaluationsService.calculatePersonalKpi(data);
  }

  @GrpcMethod('KpiService', 'GetEvaluationDetail')
  getEvaluationDetail(data: { id: number }) {
    return this.kpiEvaluationsService.getEvaluationDetail(data.id);
  }

  @GrpcMethod('KpiService', 'SubmitEvaluation')
  submitEvaluation(data: any) {
    const payload = JSON.parse(data.data);
    return this.kpiEvaluationsService.submitSelfScore(data.id, payload);
  }

  @GrpcMethod('KpiService', 'ApproveEvaluation')
  approveEvaluation(data: any) {
    const payload = JSON.parse(data.data);
    return this.kpiEvaluationsService.approveReviewerScore(data.id, payload, data.reviewerCode);
  }
}
