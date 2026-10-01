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
}
