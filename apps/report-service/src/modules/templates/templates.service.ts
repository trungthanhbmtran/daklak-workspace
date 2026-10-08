import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { validateTableConfig } from '../reports/table-engine';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  private validateTables(data: any) {
    for (const widget of data.widgets || []) {
      if (!widget.config?.table) continue;
      try {
        const config = validateTableConfig(widget.config.table);
        if (
          !config.columns.length ||
          !widget.config.source?.upstream ||
          !widget.config.source?.path ||
          widget.chartType !== 'TABLE'
        )
          throw new Error('Bảng báo cáo thiếu cấu hình');
      } catch (error) {
        throw new RpcException({
          code: 3,
          message:
            error instanceof Error
              ? error.message
              : 'Cấu hình bảng không hợp lệ',
        });
      }
    }
  }

  async createTemplate(data: any) {
    this.validateTables(data);
    return this.prisma.reportTemplate.create({
      data: {
        title: data.title,
        description: data.description,
        layout: data.layout,
        widgets: {
          create: data.widgets || [],
        },
      },
      include: { widgets: true },
    });
  }

  async getAllTemplates() {
    return this.prisma.reportTemplate.findMany({
      include: { widgets: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllWidgets() {
    return this.prisma.reportWidget.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async getTemplateById(id: number) {
    const template = await this.prisma.reportTemplate.findUnique({
      where: { id },
      include: { widgets: true },
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async updateTemplate(id: number, data: any) {
    this.validateTables(data);
    // Để update có cấu trúc phức tạp (widgets), thường ta sẽ xóa widgets cũ và tạo mới
    // hoặc upsert. Ở đây làm đơn giản: xóa cũ, thêm mới.
    await this.prisma.reportWidget.deleteMany({ where: { templateId: id } });

    return this.prisma.reportTemplate.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        layout: data.layout,
        widgets: {
          create: data.widgets || [],
        },
      },
      include: { widgets: true },
    });
  }

  async deleteTemplate(id: number) {
    return this.prisma.reportTemplate.delete({
      where: { id },
    });
  }

  async assignReport(templateId: number, assigneeType: string, assigneeId: string, permissions: string = 'VIEW') {
    // Check if template exists
    const template = await this.prisma.reportTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new RpcException({ code: 5, message: 'Template not found' });
    
    // Upsert assignment
    return this.prisma.reportAssignment.upsert({
      where: {
        templateId_assigneeType_assigneeId: {
          templateId,
          assigneeType,
          assigneeId,
        }
      },
      update: { permissions },
      create: {
        templateId,
        assigneeType,
        assigneeId,
        permissions,
      }
    });
  }

  async getMyAssignedReports(userId: number, unitId?: number) {
    const OR = [];
    if (userId) OR.push({ assigneeType: 'USER', assigneeId: userId.toString() });
    if (unitId) OR.push({ assigneeType: 'UNIT', assigneeId: unitId.toString() });
    
    if (OR.length === 0) return [];
    
    // Admin is bypassed normally at Gateway, but if here, we only fetch what is assigned
    return this.prisma.reportTemplate.findMany({
      where: {
        assignments: {
          some: {
            OR
          }
        }
      },
      include: { widgets: true, assignments: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
