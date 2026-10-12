import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { PrismaService } from '../../database/prisma.service';
import { AppCacheService } from '../../core/cache/app-cache.service';
import { lastValueFrom } from 'rxjs';
import { randomUUID } from 'crypto';
import {
  DEFAULT_KPI_FORM_TEMPLATES,
  getTemplateXmlContent,
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
    const organizationId = query?.organizationId || 'DEFAULT';
    let dbTemplates = await this.prisma.kpiFormTemplate.findMany({
      where: { OR: [{ organizationId }, { organizationId: 'DEFAULT' }] },
      include: {
        _count: {
          select: { documents: true },
        },
        bindings: { where: { organizationId, isActive: true } },
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
              organizationId: 'DEFAULT',
            },
            create: {
              formCode: def.formCode,
              name: def.name,
              description: def.description,
              templateFileId: def.fileName,
              organizationId: 'DEFAULT',
            },
          });
        }
      }

      dbTemplates = await this.prisma.kpiFormTemplate.findMany({
        where: { OR: [{ organizationId }, { organizationId: 'DEFAULT' }] },
        include: {
          _count: {
            select: { documents: true },
          },
          bindings: { where: { organizationId, isActive: true } },
        },
        orderBy: { formCode: 'asc' },
      });
    }

    const data = dbTemplates.map((item) => {
      const def = DEFAULT_KPI_FORM_TEMPLATES.find((t) => t.formCode === item.formCode);
      const xml = item.xmlContent || getTemplateXmlContent(item.formCode);
      const xmlSize = Buffer.byteLength(xml, 'utf8');

      return {
        formCode: item.formCode,
        name: item.name,
        description: item.description || '',
        templateFileId: item.templateFileId || def?.fileName || '',
        createdAt: item.createdAt ? item.createdAt.toISOString() : '',
        updatedAt: item.updatedAt ? item.updatedAt.toISOString() : '',
        category: item.category || def?.category || 'Biểu mẫu đánh giá',
        targetRole: item.targetRole || def?.targetRole || 'Toàn thể cán bộ',
        schemaVersion: item.schemaVersion || def?.schemaVersion || '1.0',
        documentCount: (item as any)._count?.documents || 0,
        organizationId: item.organizationId,
        status: item.status || 'PUBLISHED',
        version: item.version || 1,
        unitCodes: (item as any).bindings?.map((binding: any) => binding.unitCode) || [],
        processCodes: (item as any).bindings?.map((binding: any) => binding.processCode) || [],
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

  async getFormTemplateDetail(formCode: string, organizationId = 'DEFAULT') {
    let item = await this.prisma.kpiFormTemplate.findFirst({
      where: { formCode, OR: [{ organizationId }, { organizationId: 'DEFAULT' }] },
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

    const xmlContent = item.xmlContent || getTemplateXmlContent(formCode);
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
        category: item.category || def?.category || 'Biểu mẫu đánh giá',
        targetRole: item.targetRole || def?.targetRole || 'Toàn thể cán bộ',
        schemaVersion: item.schemaVersion || def?.schemaVersion || '1.0',
        documentCount: (item as any)._count?.documents || 0,
        organizationId: item.organizationId,
        status: item.status || 'PUBLISHED',
        version: item.version || 1,
        hasXmlFile: true,
        xmlSize,
      },
      xmlContent,
      placeholders,
    };
  }

  async updateFormTemplate(formCode: string, payload: any) {
    const update = await this.prisma.kpiFormTemplate.updateMany({
      where: { formCode, organizationId: payload.organizationId || 'DEFAULT' },
      data: {
        name: payload.name,
        description: payload.description,
        templateFileId: payload.templateFileId,
        category: payload.category,
        targetRole: payload.targetRole,
      },
    });
    if (update.count === 0) throw new RpcException({ code: 5, message: `Không tìm thấy biểu mẫu có thể sửa ${formCode}` });

    return this.getFormTemplateDetail(formCode, payload.organizationId || 'DEFAULT');
  }

  async createFormTemplate(payload: any) {
    const validation = validateXmlSyntax(payload.xmlContent);
    if (!validation.isValid) {
      throw new RpcException({ code: 3, message: `XML không hợp lệ: ${validation.error}` });
    }
    const formCode = `CUSTOM_${randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`;
    const storedXml = String(payload.xmlContent).replace(/(<KpiFormDocument\b[^>]*\bformCode=")[^"]*(")/, `$1${formCode}$2`);
    await this.prisma.kpiFormTemplate.create({
      data: {
        formCode,
        name: payload.name.trim(),
        description: payload.description || null,
        category: payload.category || null,
        targetRole: payload.targetRole || null,
        schemaVersion: '1.0',
        status: 'DRAFT',
        xmlContent: storedXml,
        organizationId: payload.organizationId || 'DEFAULT',
        versions: {
          create: {
            version: 1,
            xmlContent: storedXml,
            status: 'DRAFT',
            createdBy: payload.createdBy || null,
          },
        },
      },
    });
    return this.getFormTemplateDetail(formCode, payload.organizationId || 'DEFAULT');
  }

  async getFormTemplateXml(formCode: string, organizationId = 'DEFAULT') {
    const item = await this.prisma.kpiFormTemplate.findFirst({
      where: { formCode, OR: [{ organizationId }, { organizationId: 'DEFAULT' }] },
      select: { xmlContent: true },
    });
    if (!item) throw new RpcException({ code: 5, message: `Không tìm thấy biểu mẫu ${formCode}` });
    const xmlContent = item.xmlContent || getTemplateXmlContent(formCode);
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

  async saveFormTemplateXml(formCode: string, xmlContent: string, organizationId = 'DEFAULT') {
    const validation = validateXmlSyntax(xmlContent);
    if (!validation.isValid) {
      throw new RpcException({
        code: 3,
        message: `XML không hợp lệ: ${validation.error}`,
      });
    }
    const documentCode = xmlContent.match(/<KpiFormDocument\b[^>]*\bformCode="([^"]+)"/)?.[1];
    if (documentCode && documentCode !== formCode) {
      throw new RpcException({ code: 3, message: `formCode trong XML phải khớp mã mẫu ${formCode}` });
    }

    const placeholders = extractPlaceholders(xmlContent);
    const xmlSize = Buffer.byteLength(xmlContent, 'utf8');

    const template = await this.prisma.kpiFormTemplate.findFirst({
      where: { formCode, organizationId },
      select: { version: true, status: true },
    });
    if (!template) throw new RpcException({ code: 5, message: `Không tìm thấy biểu mẫu ${formCode}` });
    const nextVersion = template.status === 'PUBLISHED' ? template.version + 1 : template.version;
    await this.prisma.$transaction(async (tx) => {
      const existingRevision = await tx.kpiFormTemplateVersion.findFirst({ where: { formCode, version: nextVersion } });
      if (existingRevision) {
        await tx.kpiFormTemplateVersion.update({
          where: { id: existingRevision.id },
          data: { xmlContent, status: 'DRAFT', publishedBy: null, publishedAt: null },
        });
      } else {
        await tx.kpiFormTemplateVersion.create({
          data: { formCode, version: nextVersion, xmlContent, status: 'DRAFT', createdBy: organizationId },
        });
      }
      await tx.kpiFormTemplate.update({
        where: { formCode },
        data: { xmlContent, version: nextVersion, status: 'DRAFT', updatedAt: new Date() },
      });
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

  async listFormTemplateBindings(formCode: string, organizationId = 'DEFAULT') {
    const data = await this.prisma.kpiFormTemplateBinding.findMany({
      where: { formCode, organizationId },
      orderBy: [{ unitCode: 'asc' }, { processCode: 'asc' }, { nodeCode: 'asc' }],
    });
    return {
      success: true,
      message: 'Lấy danh sách gán mẫu thành công',
      data: data.map((binding) => this.mapFormTemplateBinding(binding)),
    };
  }

  async createFormTemplateBinding(payload: any) {
    const organizationId = payload.organizationId || 'DEFAULT';
    const unitCode = String(payload.unitCode || '').trim();
    const processDefinitionId = String(payload.processDefinitionId || '').trim();
    const processCode = String(payload.processCode || '').trim();
    if (!unitCode || !processDefinitionId || !processCode) {
      throw new RpcException({ code: 3, message: 'Cần chọn đơn vị và quy trình trước khi gán mẫu' });
    }

    const template = await this.prisma.kpiFormTemplate.findFirst({
      where: { formCode: payload.formCode, OR: [{ organizationId }, { organizationId: 'DEFAULT' }] },
      select: { formCode: true, status: true, version: true },
    });
    if (!template) throw new RpcException({ code: 5, message: `Không tìm thấy biểu mẫu ${payload.formCode}` });
    if (template.status !== 'PUBLISHED') throw new RpcException({ code: 3, message: 'Chỉ mẫu đã phát hành mới được gán vào quy trình' });

    const effectiveFrom = payload.effectiveFrom ? new Date(payload.effectiveFrom) : null;
    const effectiveTo = payload.effectiveTo ? new Date(payload.effectiveTo) : null;
    if ((effectiveFrom && Number.isNaN(effectiveFrom.getTime())) || (effectiveTo && Number.isNaN(effectiveTo.getTime()))) {
      throw new RpcException({ code: 3, message: 'Ngày hiệu lực không hợp lệ' });
    }
    if (effectiveFrom && effectiveTo && effectiveTo < effectiveFrom) {
      throw new RpcException({ code: 3, message: 'Ngày kết thúc phải sau ngày bắt đầu' });
    }

    const candidates = await this.prisma.kpiFormTemplateBinding.findMany({
      where: {
        organizationId,
        unitCode,
        processDefinitionId,
        nodeCode: payload.nodeCode || null,
        phase: payload.phase || null,
        isActive: true,
      },
    });
    const overlaps = candidates.some((candidate) => {
      const candidateStart = candidate.effectiveFrom?.getTime() ?? Number.NEGATIVE_INFINITY;
      const candidateEnd = candidate.effectiveTo?.getTime() ?? Number.POSITIVE_INFINITY;
      const newStart = effectiveFrom?.getTime() ?? Number.NEGATIVE_INFINITY;
      const newEnd = effectiveTo?.getTime() ?? Number.POSITIVE_INFINITY;
      return candidateStart <= newEnd && newStart <= candidateEnd;
    });
    if (overlaps) {
      throw new RpcException({ code: 6, message: 'Đã có mẫu đang hoạt động cho đơn vị, quy trình, bước và thời gian này' });
    }

    const binding = await this.prisma.kpiFormTemplateBinding.create({
      data: {
        formCode: payload.formCode,
        organizationId,
        unitCode,
        processDefinitionId,
        processCode,
        templateVersion: template.version,
        nodeCode: payload.nodeCode || null,
        phase: payload.phase || null,
        effectiveFrom,
        effectiveTo,
        createdBy: payload.createdBy || null,
      },
    });
    return {
      success: true,
      message: 'Đã gán biểu mẫu cho đơn vị và quy trình',
      data: this.mapFormTemplateBinding(binding),
    };
  }

  async deleteFormTemplateBinding(id: number, organizationId = 'DEFAULT') {
    const result = await this.prisma.kpiFormTemplateBinding.updateMany({
      where: { id, organizationId, isActive: true },
      data: { isActive: false, updatedAt: new Date() },
    });
    if (result.count === 0) throw new RpcException({ code: 5, message: 'Không tìm thấy cấu hình gán mẫu đang hoạt động' });
    const data = await this.prisma.kpiFormTemplateBinding.findFirst({ where: { id, organizationId } });
    return {
      success: true,
      message: 'Đã gỡ gán biểu mẫu',
      data: data ? this.mapFormTemplateBinding(data) : undefined,
    };
  }

  async publishFormTemplate(formCode: string, organizationId = 'DEFAULT', publishedBy?: string) {
    const template = await this.prisma.kpiFormTemplate.findFirst({
      where: { formCode, organizationId },
      select: { xmlContent: true, version: true },
    });
    if (!template) throw new RpcException({ code: 5, message: `Không tìm thấy biểu mẫu ${formCode}` });
    const xmlContent = template.xmlContent || getTemplateXmlContent(formCode);
    const validation = validateXmlSyntax(xmlContent);
    if (!validation.isValid) throw new RpcException({ code: 3, message: `XML không hợp lệ: ${validation.error}` });
    const revision = await this.prisma.kpiFormTemplateVersion.findFirst({ where: { formCode, version: template.version } });
    await this.prisma.$transaction(async (tx) => {
      if (revision) {
        await tx.kpiFormTemplateVersion.update({
          where: { id: revision.id },
          data: { status: 'PUBLISHED', publishedBy: publishedBy || null, publishedAt: new Date() },
        });
      } else {
        await tx.kpiFormTemplateVersion.create({
          data: {
            formCode,
            version: template.version,
            xmlContent,
            status: 'PUBLISHED',
            createdBy: organizationId,
            publishedBy: publishedBy || null,
            publishedAt: new Date(),
          },
        });
      }
      await tx.kpiFormTemplate.updateMany({ where: { formCode, organizationId }, data: { status: 'PUBLISHED' } });
    });
    return this.getFormTemplateDetail(formCode, organizationId);
  }

  async resolveFormTemplateBinding(query: any) {
    const now = new Date();
    const bindings = await this.prisma.kpiFormTemplateBinding.findMany({
      where: {
        organizationId: query.organizationId,
        unitCode: query.unitCode,
        processDefinitionId: query.processDefinitionId,
        isActive: true,
        OR: [{ nodeCode: query.nodeCode }, { nodeCode: null }],
        AND: [
          { OR: [{ phase: query.phase }, { phase: null }] },
          { OR: [{ effectiveFrom: null }, { effectiveFrom: { lte: now } }] },
          { OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }] },
        ],
      },
      include: { template: { include: { versions: true } } },
    });
    const published = bindings.filter((binding) => binding.template.status === 'PUBLISHED');
    published.sort((left, right) => Number(Boolean(right.nodeCode)) - Number(Boolean(left.nodeCode)) || Number(Boolean(right.phase)) - Number(Boolean(left.phase)));
    const selected = published[0];
    if (!selected) throw new RpcException({ code: 5, message: 'Không có biểu mẫu đã phát hành phù hợp với đơn vị và bước quy trình' });
    if (published[1] && Boolean(published[1].nodeCode) === Boolean(selected.nodeCode) && Boolean(published[1].phase) === Boolean(selected.phase)) {
      throw new RpcException({ code: 6, message: 'Có nhiều biểu mẫu cùng độ ưu tiên phù hợp với bước quy trình' });
    }
    return {
      success: true,
      message: 'Đã tìm thấy biểu mẫu áp dụng',
      data: {
        bindingId: selected.id,
        formCode: selected.formCode,
        name: selected.template.name,
        unitCode: selected.unitCode,
        processCode: selected.processCode,
        nodeCode: selected.nodeCode || '',
        phase: selected.phase || '',
        templateVersion: selected.templateVersion,
        xmlContent: selected.template.versions.find((version) => version.version === selected.templateVersion)?.xmlContent || selected.template.xmlContent || getTemplateXmlContent(selected.formCode),
      },
    };
  }

  private mapFormTemplateBinding(binding: any) {
    return {
      id: binding.id,
      formCode: binding.formCode,
      organizationId: binding.organizationId,
      unitCode: binding.unitCode,
      processDefinitionId: binding.processDefinitionId,
      processCode: binding.processCode,
      templateVersion: binding.templateVersion || 1,
      nodeCode: binding.nodeCode || '',
      phase: binding.phase || '',
      effectiveFrom: binding.effectiveFrom?.toISOString?.() || '',
      effectiveTo: binding.effectiveTo?.toISOString?.() || '',
      isActive: binding.isActive,
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
