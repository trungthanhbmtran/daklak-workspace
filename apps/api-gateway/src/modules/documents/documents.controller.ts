import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, UseGuards, OnModuleInit } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Documents')
@Controller('admin/documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DocumentsController implements OnModuleInit {
  private documentService: any;

  constructor(
    @Inject(MICROSERVICES.DOCUMENT.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.documentService = this.client.getService(MICROSERVICES.DOCUMENT.SERVICE);
  }

  @Get()
  async listDocuments(@Query() query: any) {
    const req = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search,
      typeId: query.typeId,
      fieldId: query.fieldId,
      status: query.status,
      urgency: query.urgency,
      startDate: query.startDate,
      endDate: query.endDate,
      isPublic: query.isPublic === 'true',
      fiscalYear: query.fiscalYear ? parseInt(query.fiscalYear) : 0,
      transparencyCategory: query.transparencyCategory,
    };
    return firstValueFrom(this.documentService.ListDocuments(req));
  }

  @Get(':id')
  async getDocument(@Param('id') id: string) {
    return firstValueFrom(this.documentService.GetDocument({ id }));
  }

  @Post()
  async createDocument(@Body() body: any) {
    return firstValueFrom(this.documentService.CreateDocument(body));
  }

  @Put(':id')
  async updateDocument(@Param('id') id: string, @Body() body: any) {
    const payload = { id, ...body };
    return firstValueFrom(this.documentService.UpdateDocument(payload));
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string) {
    return firstValueFrom(this.documentService.DeleteDocument({ id }));
  }
}
