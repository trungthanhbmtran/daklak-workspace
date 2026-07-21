import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { DocumentsService } from './documents.service';

@ApiTags('Documents')
@Controller('admin/documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('stats')
  async getStats() {
    return this.documentsService.getStats();
  }

  @Get()
  async listDocuments(@Query() query: any) {
    return this.documentsService.listDocuments(query);
  }

  // --- Administrative Procedures CRUD ---
  @Get('procedures/list')
  async listAdminProcedures(@Query() query: any) {
    return this.documentsService.listAdminProcedures(query);
  }

  @Get('procedures/:id')
  async getAdminProcedure(@Param('id') id: string) {
    return this.documentsService.getAdminProcedure(id);
  }

  @Post('procedures')
  async createAdminProcedure(@Body() body: any) {
    return this.documentsService.createAdminProcedure(body);
  }

  @Put('procedures/:id')
  async updateAdminProcedure(@Param('id') id: string, @Body() body: any) {
    return this.documentsService.updateAdminProcedure(id, body);
  }

  @Delete('procedures/:id')
  async deleteAdminProcedure(@Param('id') id: string) {
    return this.documentsService.deleteAdminProcedure(id);
  }

  // --- One-Stop Dossiers CRUD ---
  @Get('dossiers/list')
  async listAdminDossiers(@Query() query: any) {
    return this.documentsService.listAdminDossiers(query);
  }

  @Get('dossiers/:id')
  async getAdminDossier(@Param('id') id: string) {
    return this.documentsService.getAdminDossier(id);
  }

  @Post('dossiers')
  async createAdminDossier(@Body() body: any) {
    return this.documentsService.createAdminDossier(body);
  }

  @Put('dossiers/:id')
  async updateAdminDossier(@Param('id') id: string, @Body() body: any) {
    return this.documentsService.updateAdminDossier(id, body);
  }

  @Delete('dossiers/:id')
  async deleteAdminDossier(@Param('id') id: string) {
    return this.documentsService.deleteAdminDossier(id);
  }

  // --- Cabinet ---
  @Get('cabinet')
  async listCabinetFiles(
    @Req() req: any,
    @Query('userId') userId: string,
    @Query('orgId') orgId: string,
  ) {
    return this.documentsService.listCabinetFiles(req.user, userId, orgId);
  }

  @Post('cabinet')
  async addCabinetFile(@Req() req: any, @Body() body: any) {
    return this.documentsService.addCabinetFile(req.user, body);
  }

  @Delete('cabinet/:id')
  async deleteCabinetFile(@Param('id') id: string) {
    return this.documentsService.deleteCabinetFile(id);
  }

  // --- Components ---
  @Get('dossiers/:id/components')
  async getComponents(@Param('id') id: string) {
    return this.documentsService.getComponents(id);
  }

  @Put('dossiers/components/:compId')
  async updateComponent(@Param('compId') id: string, @Body() body: any) {
    return this.documentsService.updateComponent(id, body);
  }

  @Post('dossiers/from-template')
  async createDossierFromTemplate(
    @Body() body: { procedureId: string; senderName: string },
  ) {
    return this.documentsService.createDossierFromTemplate(body);
  }

  @Post('dossiers/create-blank')
  async createBlankDossier(
    @Body() body: { procedureName: string; senderName: string },
  ) {
    return this.documentsService.createBlankDossier(body);
  }

  @Post('dossiers/:id/components')
  async addComponentFromCabinet(
    @Param('id') dossierId: string,
    @Body() body: { name: string; fileUrl: string },
  ) {
    return this.documentsService.addComponentFromCabinet(dossierId, body);
  }

  @Get(':id')
  async getDocument(@Param('id') id: string) {
    return this.documentsService.getDocument(id);
  }

  @Post()
  async createDocument(@Req() req: any, @Body() body: any) {
    return this.documentsService.createDocument(req.user, body);
  }

  @Put(':id')
  async updateDocument(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.documentsService.updateDocument(id, req.user, body);
  }

  @Post('extract')
  async extractMetadata(@Body() body: { fileId: string }) {
    return this.documentsService.extractMetadata(body);
  }

  @Post('sync')
  async syncOnline() {
    return this.documentsService.syncOnline();
  }

  @Get(':id/logs')
  async getDocumentLogs(@Param('id') id: string) {
    return this.documentsService.getDocumentLogs(id);
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string) {
    return this.documentsService.deleteDocument(id);
  }
}
