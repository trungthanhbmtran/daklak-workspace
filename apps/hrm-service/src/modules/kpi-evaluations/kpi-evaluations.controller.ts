import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { KpiEvaluationsService } from './kpi-evaluations.service';

@Controller()
export class KpiEvaluationsController {
  constructor(private readonly kpiEvaluationsService: KpiEvaluationsService) {}

  @GrpcMethod('KpiService', 'FindPeriods')
  findPeriods(data: any) {
    data = data || {};
    return this.kpiEvaluationsService.findPeriods();
  }

  @GrpcMethod('KpiService', 'CreatePeriod')
  createPeriod(data: any) {
    data = data || {};
    return this.kpiEvaluationsService.createPeriod(data);
  }

  @GrpcMethod('KpiService', 'FindCriteria')
  findCriteria(data: any) {
    data = data || {};
    return this.kpiEvaluationsService.findCriteria(data);
  }

  @GrpcMethod('KpiService', 'CreateCriterion')
  createCriterion(data: any) {
    data = data || {};
    return this.kpiEvaluationsService.createCriterion(data);
  }

  @GrpcMethod('KpiService', 'UpdateCriterion')
  updateCriterion(data: any) {
    data = data || {};
    return this.kpiEvaluationsService.updateCriterion(data.id, data);
  }

  @GrpcMethod('KpiService', 'DeleteCriterion')
  deleteCriterion(data: { id: number }) {
    data = data || ({} as any);
    return this.kpiEvaluationsService.deleteCriterion(data.id);
  }

  @GrpcMethod('KpiService', 'CreateEvaluation')
  createEvaluation(data: any) {
    data = data || {};
    return this.kpiEvaluationsService.createEvaluation(data);
  }

  @GrpcMethod('KpiService', 'FindEvaluations')
  findEvaluations(data: any) {
    data = data || {};
    return this.kpiEvaluationsService.findEvaluations(data);
  }

  @GrpcMethod('KpiService', 'CalculatePersonalKpi')
  calculatePersonalKpi(data: { periodId: number, employeeCode: string }) {
    data = data || ({} as any);
    return this.kpiEvaluationsService.calculatePersonalKpi(data);
  }

  @GrpcMethod('KpiService', 'GetEvaluationDetail')
  getEvaluationDetail(data: { id: number }) {
    data = data || ({} as any);
    return this.kpiEvaluationsService.getEvaluationDetail(data.id);
  }

  @GrpcMethod('KpiService', 'SubmitEvaluation')
  submitEvaluation(data: any) {
    data = data || {};
    let payload: any = {};
    try { payload = typeof data.data === 'string' ? JSON.parse(data.data) : (data.data || {}); } catch { payload = {}; }
    return this.kpiEvaluationsService.submitSelfScore(data.id, payload);
  }

  @GrpcMethod('KpiService', 'ApproveEvaluation')
  approveEvaluation(data: any) {
    data = data || {};
    let payload: any = {};
    try { payload = typeof data.data === 'string' ? JSON.parse(data.data) : (data.data || {}); } catch { payload = {}; }
    return this.kpiEvaluationsService.approveReviewerScore(data.id, payload, data.reviewerCode);
  }

  @GrpcMethod('KpiService', 'FindFormTemplates')
  findFormTemplates(data: any) {
    data = data || {};
    return this.kpiEvaluationsService.findFormTemplates(data);
  }

  @GrpcMethod('KpiService', 'GetFormTemplateDetail')
  getFormTemplateDetail(data: { formCode: string; organizationId?: string }) {
    data = data || ({} as any);
    return this.kpiEvaluationsService.getFormTemplateDetail(data.formCode, data.organizationId);
  }

  @GrpcMethod('KpiService', 'UpdateFormTemplate')
  updateFormTemplate(data: any) {
    data = data || {};
    return this.kpiEvaluationsService.updateFormTemplate(data.formCode, data);
  }

  @GrpcMethod('KpiService', 'GetFormTemplateXml')
  getFormTemplateXml(data: { formCode: string; organizationId?: string }) {
    data = data || ({} as any);
    return this.kpiEvaluationsService.getFormTemplateXml(data.formCode, data.organizationId);
  }

  @GrpcMethod('KpiService', 'SaveFormTemplateXml')
  saveFormTemplateXml(data: { formCode: string; xmlContent: string; organizationId?: string }) {
    data = data || ({} as any);
    return this.kpiEvaluationsService.saveFormTemplateXml(data.formCode, data.xmlContent, data.organizationId);
  }

  @GrpcMethod('KpiService', 'ValidateFormTemplateXml')
  validateFormTemplateXml(data: { xmlContent: string }) {
    data = data || ({} as any);
    return this.kpiEvaluationsService.validateFormTemplateXml(data.xmlContent);
  }

  @GrpcMethod('KpiService', 'CreateFormTemplate')
  createFormTemplate(data: any) {
    data = data || {};
    return this.kpiEvaluationsService.createFormTemplate(data);
  }

  @GrpcMethod('KpiService', 'ListFormTemplateBindings')
  listFormTemplateBindings(data: any) {
    data = data || {};
    return this.kpiEvaluationsService.listFormTemplateBindings(data.formCode, data.organizationId);
  }

  @GrpcMethod('KpiService', 'CreateFormTemplateBinding')
  createFormTemplateBinding(data: any) {
    data = data || {};
    return this.kpiEvaluationsService.createFormTemplateBinding(data);
  }

  @GrpcMethod('KpiService', 'DeleteFormTemplateBinding')
  deleteFormTemplateBinding(data: any) {
    data = data || {};
    return this.kpiEvaluationsService.deleteFormTemplateBinding(data.id, data.organizationId);
  }

  @GrpcMethod('KpiService', 'PublishFormTemplate')
  publishFormTemplate(data: any) {
    data = data || {};
    return this.kpiEvaluationsService.publishFormTemplate(data.formCode, data.organizationId, data.publishedBy);
  }

  @GrpcMethod('KpiService', 'ResolveFormTemplateBinding')
  resolveFormTemplateBinding(data: any) {
    data = data || {};
    return this.kpiEvaluationsService.resolveFormTemplateBinding(data);
  }
}
