import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { PrismaService } from '../../database/prisma.service';
import { AppCacheService } from '../../core/cache/app-cache.service';
import { lastValueFrom } from 'rxjs';
import {
  DEFAULT_KPI_FORM_TEMPLATES,
  getTemplateXmlContent,
  saveTemplateXmlContent,
  extractPlaceholders,
  validateXmlSyntax,
} from './kpi-template-xml.util';

@Injectable()
export class KpiEvaluationsService implements OnModuleInit {
  private docSvc: any;
  private sysConfigSvc: any;

  constructor(
    private prisma: PrismaService,
    private cache: AppCacheService,
    @Inject('DOCUMENT_PACKAGE') private documentClient: ClientGrpc,
    @Inject('SYSTEM_CONFIG_PACKAGE') private systemConfigClient: ClientGrpc
  ) { }

  onModuleInit() {
    this.docSvc = this.documentClient.getService<any>('DocumentService');
    this.sysConfigSvc = this.systemConfigClient.getService<any>('SystemConfigService');
  }

  // 1. Quản lý Kỳ Đánh Giá (KpiPeriod)
  async findPeriods(query?: any) {
    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 0;

    const periods = await this.prisma.kpiPeriod.findMany({
      orderBy: { startDate: 'desc' },
    });

    const actualLimit = limit > 0 ? limit : periods.length;
    const skip = (page - 1) * actualLimit;
    const paginatedItems = actualLimit > 0 ? periods.slice(skip, skip + actualLimit) : periods;
    
    return {
      success: true,
      message: 'Lấy danh sách kỳ đánh giá thành công',
      data: paginatedItems.map((p: any) => ({
        ...p,
        startDate: p.startDate ? new Date(p.startDate).toISOString() : '',
        endDate: p.endDate ? new Date(p.endDate).toISOString() : '',
      })),
      meta: {
        pagination: {
          total: periods.length,
          page: 1,
          pageSize: actualLimit,
          totalPages: 1
        }
      }
    };
  }

  async createPeriod(data: any) {
    const p = await this.prisma.kpiPeriod.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      }
    });
    return {
      ...p,
      startDate: p.startDate?.toISOString() || '',
      endDate: p.endDate?.toISOString() || '',
    };
  }

  // Tiêu chí đã bị xóa. Chỗ này tạm trả về mảng rỗng để không lỗi UI cũ
  async findCriteria(query: any = {}) {
    return {
      success: true,
      data: [],
      meta: { pagination: { total: 0, page: 1, pageSize: 10, totalPages: 1 }, allowedActions: [] }
    };
  }

  async createCriterion(data: any) { return {}; }
  async updateCriterion(id: number, data: any) { return {}; }
  async deleteCriterion(id: number) { return { success: true }; }


  // 2. Logic Trục Liên Thông (LGSP)
  private async fetchLgspFailedCount(periodStart: Date, periodEnd: Date, employeeCode: string): Promise<number> {
    try {
      const employee = await this.prisma.employee.findUnique({ where: { employeeCode }});
      
      let lgspOrganId = "H15.151"; // Fallback
      try {
        const configRes: any = await lastValueFrom(this.sysConfigSvc.GetConfigs({}));
        if (configRes && configRes.configs) {
          const orgConfig = configRes.configs.find((c: any) => c.key === 'LGSP_ORGANIZATION_ID');
          if (orgConfig && orgConfig.value) {
            lgspOrganId = orgConfig.value;
          }
        }
      } catch (e: any) {
        console.warn(`[Integration] Could not fetch LGSP_ORGANIZATION_ID from user-service: ${e.message}`);
      }

      const payload = {
        fromOrganId: lgspOrganId,
        documentType: "8",
        trangThaiTiepNhan: "fail",
        startDate: periodStart.toISOString().split('T')[0],
        endDate: periodEnd.toISOString().split('T')[0]
      };
      
      const res: any = await lastValueFrom(this.docSvc.FetchLgspStatistics(payload));
      if (res && res.success) {
        const stats = JSON.parse(res.data);
        return stats.failed || 0;
      }
      return 0;
    } catch (err) {
      console.error(`[Integration] Error fetching LGSP metric:`, err);
      return 0;
    }
  }

  // 3. Logic Đánh Giá (KpiEvaluation)
  async createEvaluation(data: any) {
    const evalData = await this.prisma.kpiEvaluation.create({
      data: {
        employeeCode: data.employeeCode,
        periodId: data.periodId,
        status: 'DRAFT',
      }
    });
    return evalData;
  }

  async findEvaluations(query: any) {
    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 0;
    const where: any = {};
    const employeeCode = typeof query === 'object' ? query.employeeCode : query;

    if (employeeCode) where.employeeCode = employeeCode;
    if (query?.periodId) where.periodId = Number(query.periodId);

    const totalCount = await this.prisma.kpiEvaluation.count({ where });
    const limitNum = limit > 0 ? limit : (totalCount > 0 ? totalCount : 10);
    const skip = (page - 1) * limitNum;

    const allEvaluations = await this.prisma.kpiEvaluation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: limit > 0 ? skip : undefined,
      take: limit > 0 ? limitNum : undefined,
      include: { employee: true }
    });

    return {
      success: true,
      message: 'Lấy danh sách đánh giá thành công',
      data: allEvaluations.map((e: any) => ({
        ...e,
        employeeName: e.employee ? e.employee.fullName : e.employeeCode
      })),
      meta: {
        pagination: {
          total: totalCount,
          page,
          pageSize: limitNum,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      }
    };
  }

  

  // TÍNH ĐIỂM TỰ ĐỘNG DỰA TRÊN SỐ LIỆU LGSP VÀ CÔNG VIỆC TRÊN HỆ THỐNG
  async calculatePersonalKpi(data: { periodId: number | string, employeeCode: string, staffingSlotId?: number }) {
    const periodId = Number(data.periodId);
    const { employeeCode, staffingSlotId } = data;

    const period = await this.prisma.kpiPeriod.findUnique({ where: { id: periodId } });
    if (!period) throw new RpcException({ message: 'Kỳ đánh giá không tồn tại', code: 3 });

    // 1. Tính toán điểm Công việc Hệ thống
    let taskScore = 0;
    
    // Tìm các công việc hoàn thành trong kỳ
    const taskParticipants = await this.prisma.taskParticipant.findMany({
      where: {
        employeeCode: employeeCode,
        participantRole: { in: ['ASSIGNEE', 'COORDINATOR'] },
        task: {
          isCompleted: true,
          completedAt: { gte: period.startDate, lte: period.endDate }
        }
      },
      include: { task: true }
    });

    for (const tp of taskParticipants) {
      // Giả sử mỗi công việc hoàn thành được 10 điểm cơ bản
      taskScore += 10 * ((tp.contributionPercentage || 100) / 100);
    }

    // 2. Tính toán điểm LGSP (Trừ điểm nếu lỗi)
    const failedLgspCount = await this.fetchLgspFailedCount(period.startDate, period.endDate, employeeCode);
    const lgspPenalty = failedLgspCount * 2; // Trừ 2 điểm cho mỗi văn bản lỗi LGSP

    const finalTotalScore = Math.max(0, taskScore - lgspPenalty); // Điểm thấp nhất là 0

    // Upsert Evaluation
    let existingEvaluation = await this.prisma.kpiEvaluation.findFirst({
      where: { employeeCode, periodId }
    });

    if (!existingEvaluation) {
      existingEvaluation = await this.prisma.kpiEvaluation.create({
        data: {
          employeeCode,
          periodId,
          totalScore: finalTotalScore,
          taskScoreSelf: taskScore,
          generalScoreSelf: -lgspPenalty, // Lưu tạm điểm phạt vào generalScore
          status: 'COMPUTING'
        }
      });
    } else {
      existingEvaluation = await this.prisma.kpiEvaluation.update({
        where: { id: existingEvaluation.id },
        data: { 
          totalScore: finalTotalScore,
          taskScoreSelf: taskScore,
          generalScoreSelf: -lgspPenalty,
          status: 'COMPUTING' 
        }
      });
    }

    const generatedXml = `<?xml version="1.0" encoding="UTF-8"?>
<KpiEvaluationDocument>
  <PeriodId>${periodId}</PeriodId>
  <EmployeeCode>${employeeCode}</EmployeeCode>
  <Scores>
    <TaskScore>${taskScore || 0}</TaskScore>
    <LgspPenalty>${lgspPenalty || 0}</LgspPenalty>
    <FinalTotal>${finalTotalScore || 0}</FinalTotal>
  </Scores>
  <Metrics>
    <FailedLgspDocuments>${failedLgspCount || 0}</FailedLgspDocuments>
  </Metrics>
  <SelfAssessment>
    <Feedback>Hoàn thành tốt nhiệm vụ được giao trên hệ thống.</Feedback>
  </SelfAssessment>
  <Signature>
    <Timestamp>${new Date().toISOString()}</Timestamp>
    <DigitalSignature>O=DakLak, CN=AutoSign</DigitalSignature>
  </Signature>
</KpiEvaluationDocument>`;

    return {
      success: true,
      message: 'Tính điểm KPI tự động thành công',
      totalScore: finalTotalScore,
      taskScore: taskScore,
      lgspPenalty: lgspPenalty,
      failedLgspCount: failedLgspCount,
      evaluationId: existingEvaluation.id,
      xmlContent: generatedXml
    };
  }

  async getEvaluationDetail(id: number | string) {
    const evaluation = await this.prisma.kpiEvaluation.findUnique({
      where: { id: Number(id) },
      include: { employee: true, documents: true }
    });

    if (!evaluation) {
      throw new RpcException({ message: 'Không tìm thấy phiếu đánh giá', code: 3 });
    }

    return {
      success: true,
      message: 'Lấy chi tiết thành công',
      data: JSON.stringify(evaluation)
    };
  }

  async submitSelfScore(id: number, payload: any) {
    await this.prisma.kpiEvaluation.update({
      where: { id },
      data: { status: 'SUBMITTED' }
    });
    return { success: true, message: 'Nộp phiếu đánh giá thành công', data: JSON.stringify({ status: 'SUBMITTED' }) };
  }

  async approveReviewerScore(id: number, payload: any, reviewerCode: string) {
    await this.prisma.kpiEvaluation.update({
      where: { id },
      data: { status: 'APPROVED', reviewerCode: reviewerCode }
    });
    return { success: true, message: 'Đã chốt phiếu đánh giá', data: JSON.stringify({ status: 'APPROVED' }) };
  }

  // 4. Quản lý Biểu mẫu Đánh giá (KpiFormTemplate & File XML Mẫu)
  async findFormTemplates(query?: any) {
    let dbTemplates = await this.prisma.kpiFormTemplate.findMany({
      include: {
        _count: {
          select: { documents: true },
        },
      },
      orderBy: { formCode: 'asc' },
    });

    if (dbTemplates.length < DEFAULT_KPI_FORM_TEMPLATES.length) {
      for (const def of DEFAULT_KPI_FORM_TEMPLATES) {
        const found = dbTemplates.find((t) => t.formCode === def.formCode);
        if (!found) {
          await this.prisma.kpiFormTemplate.upsert({
            where: { formCode: def.formCode },
            update: {
              name: def.name,
              description: def.description,
              templateFileId: def.fileName,
            },
            create: {
              formCode: def.formCode,
              name: def.name,
              description: def.description,
              templateFileId: def.fileName,
            },
          });
        }
      }

      dbTemplates = await this.prisma.kpiFormTemplate.findMany({
        include: {
          _count: {
            select: { documents: true },
          },
        },
        orderBy: { formCode: 'asc' },
      });
    }

    const data = dbTemplates.map((item) => {
      const def = DEFAULT_KPI_FORM_TEMPLATES.find((t) => t.formCode === item.formCode);
      const xml = getTemplateXmlContent(item.formCode);
      const xmlSize = Buffer.byteLength(xml, 'utf8');

      return {
        formCode: item.formCode,
        name: item.name,
        description: item.description || '',
        templateFileId: item.templateFileId || def?.fileName || '',
        createdAt: item.createdAt ? item.createdAt.toISOString() : '',
        updatedAt: item.updatedAt ? item.updatedAt.toISOString() : '',
        category: def?.category || 'Biểu mẫu đánh giá',
        targetRole: def?.targetRole || 'Toàn thể cán bộ',
        schemaVersion: def?.schemaVersion || '1.0',
        documentCount: (item as any)._count?.documents || 0,
        hasXmlFile: true,
        xmlSize,
      };
    });

    return {
      success: true,
      message: 'Lấy danh sách biểu mẫu thành công',
      data,
    };
  }

  async getFormTemplateDetail(formCode: string) {
    let item = await this.prisma.kpiFormTemplate.findUnique({
      where: { formCode },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    const def = DEFAULT_KPI_FORM_TEMPLATES.find((t) => t.formCode === formCode);
    if (!item && def) {
      item = await this.prisma.kpiFormTemplate.create({
        data: {
          formCode: def.formCode,
          name: def.name,
          description: def.description,
          templateFileId: def.fileName,
        },
        include: {
          _count: {
            select: { documents: true },
          },
        },
      });
    }

    if (!item) {
      throw new RpcException({ message: `Không tìm thấy biểu mẫu ${formCode}`, code: 5 });
    }

    const xmlContent = getTemplateXmlContent(formCode);
    const placeholders = extractPlaceholders(xmlContent);
    const xmlSize = Buffer.byteLength(xmlContent, 'utf8');

    return {
      success: true,
      message: 'Lấy chi tiết biểu mẫu thành công',
      data: {
        formCode: item.formCode,
        name: item.name,
        description: item.description || '',
        templateFileId: item.templateFileId || def?.fileName || '',
        createdAt: item.createdAt ? item.createdAt.toISOString() : '',
        updatedAt: item.updatedAt ? item.updatedAt.toISOString() : '',
        category: def?.category || 'Biểu mẫu đánh giá',
        targetRole: def?.targetRole || 'Toàn thể cán bộ',
        schemaVersion: def?.schemaVersion || '1.0',
        documentCount: (item as any)._count?.documents || 0,
        hasXmlFile: true,
        xmlSize,
      },
      xmlContent,
      placeholders,
    };
  }

  async updateFormTemplate(formCode: string, payload: any) {
    await this.prisma.kpiFormTemplate.update({
      where: { formCode },
      data: {
        name: payload.name,
        description: payload.description,
        templateFileId: payload.templateFileId,
      },
    });

    return this.getFormTemplateDetail(formCode);
  }

  async getFormTemplateXml(formCode: string) {
    const xmlContent = getTemplateXmlContent(formCode);
    const placeholders = extractPlaceholders(xmlContent);
    const xmlSize = Buffer.byteLength(xmlContent, 'utf8');

    return {
      success: true,
      message: 'Lấy file XML mẫu thành công',
      formCode,
      xmlContent,
      placeholders,
      xmlSize,
    };
  }

  async saveFormTemplateXml(formCode: string, xmlContent: string) {
    const validation = validateXmlSyntax(xmlContent);
    if (!validation.isValid) {
      throw new RpcException({
        code: 3,
        message: `XML không hợp lệ: ${validation.error}`,
      });
    }

    saveTemplateXmlContent(formCode, xmlContent);
    const placeholders = extractPlaceholders(xmlContent);
    const xmlSize = Buffer.byteLength(xmlContent, 'utf8');

    await this.prisma.kpiFormTemplate.updateMany({
      where: { formCode },
      data: { updatedAt: new Date() },
    });

    return {
      success: true,
      message: `Đã lưu file XML mẫu ${formCode} thành công`,
      formCode,
      xmlContent,
      placeholders,
      xmlSize,
    };
  }

  async validateFormTemplateXml(xmlContent: string) {
    const validation = validateXmlSyntax(xmlContent);
    const placeholders = validation.isValid ? extractPlaceholders(xmlContent) : [];

    return {
      isValid: validation.isValid,
      message: validation.isValid ? 'Cú pháp XML hợp lệ' : (validation.error || 'Cú pháp XML không hợp lệ'),
      error: validation.error,
      placeholders,
    };
  }
}
