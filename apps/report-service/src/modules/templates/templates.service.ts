import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async createTemplate(data: any) {
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

  async getTemplateById(id: number) {
    const template = await this.prisma.reportTemplate.findUnique({
      where: { id },
      include: { widgets: true },
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async updateTemplate(id: number, data: any) {
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
