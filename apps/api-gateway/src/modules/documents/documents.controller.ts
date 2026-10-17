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
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';
import { DocumentsService } from './documents.service';

@ApiTags('Documents')
@Controller('admin/documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly issuer: TokenIssuerService,
  ) {}

  private getGrpcMetadata(req: any) {
    const meta = new Metadata();
    meta.set(
      'authorization',
      'Bearer ' +
        this.issuer.signDelegation(req.user, {
          requestId: randomUUID(),
          ipAddress: clientIp(req),
        }),
    );
    return meta;
  }

  @Get()
  async listDocuments(@Req() req: any, @Query() query: any) {
    return this.documentsService.listDocuments(
      query,
      req?.user,
      this.getGrpcMetadata(req),
    );
  }

  // --- Administrative Procedures CRUD ---
  @Get('procedures/list')
  async listAdminProcedures(@Req() req: any, @Query() query: any) {
    return this.documentsService.listAdminProcedures(
      query,
      this.getGrpcMetadata(req),
    );
  }

  @Get('procedures/:id')
  async getAdminProcedure(@Req() req: any, @Param('id') id: string) {
    return this.documentsService.getAdminProcedure(id, this.getGrpcMetadata(req));
  }

  @Post('procedures')
  async createAdminProcedure(@Req() req: any, @Body() body: any) {
    return this.documentsService.createAdminProcedure(
      body,
      this.getGrpcMetadata(req),
    );
  }

  @Put('procedures/:id')
  async updateAdminProcedure(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.documentsService.updateAdminProcedure(
      id,
      body,
      this.getGrpcMetadata(req),
    );
  }

  @Delete('procedures/:id')
  async deleteAdminProcedure(@Req() req: any, @Param('id') id: string) {
    return this.documentsService.deleteAdminProcedure(
      id,
      this.getGrpcMetadata(req),
    );
  }

  // --- One-Stop Dossiers CRUD ---
  @Get('dossiers/list')
  async listAdminDossiers(@Req() req: any, @Query() query: any) {
    return this.documentsService.listAdminDossiers(
      query,
      this.getGrpcMetadata(req),
    );
  }

  @Get('dossiers/:id')
  async getAdminDossier(@Req() req: any, @Param('id') id: string) {
    return this.documentsService.getAdminDossier(id, this.getGrpcMetadata(req));
  }

  @Post('dossiers')
  async createAdminDossier(@Req() req: any, @Body() body: any) {
    return this.documentsService.createAdminDossier(
      body,
      this.getGrpcMetadata(req),
    );
  }

  @Put('dossiers/:id')
  async updateAdminDossier(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.documentsService.updateAdminDossier(
      id,
      body,
      this.getGrpcMetadata(req),
    );
  }

  @Delete('dossiers/:id')
  async deleteAdminDossier(@Req() req: any, @Param('id') id: string) {
    return this.documentsService.deleteAdminDossier(
      id,
      this.getGrpcMetadata(req),
    );
  }

  // --- Cabinet ---
  @Get('cabinet')
  async listCabinetFiles(
    @Req() req: any,
    @Query('userId') userId: string,
    @Query('orgId') orgId: string,
  ) {
    return this.documentsService.listCabinetFiles(
      req.user,
      userId,
      orgId,
      this.getGrpcMetadata(req),
    );
  }

  @Post('cabinet')
  async addCabinetFile(@Req() req: any, @Body() body: any) {
    return this.documentsService.addCabinetFile(
      req.user,
      body,
      this.getGrpcMetadata(req),
    );
  }

  @Delete('cabinet/:id')
  async deleteCabinetFile(@Req() req: any, @Param('id') id: string) {
    return this.documentsService.deleteCabinetFile(
      id,
      this.getGrpcMetadata(req),
    );
  }

  // --- Components ---
  @Get('dossiers/:id/components')
  async getComponents(@Req() req: any, @Param('id') id: string) {
    return this.documentsService.getComponents(id, this.getGrpcMetadata(req));
  }

  @Put('dossiers/components/:compId')
  async updateComponent(
    @Req() req: any,
    @Param('compId') id: string,
    @Body() body: any,
  ) {
    return this.documentsService.updateComponent(
      id,
      body,
      this.getGrpcMetadata(req),
    );
  }

  @Post('dossiers/from-template')
  async createDossierFromTemplate(
    @Req() req: any,
    @Body() body: { procedureId: string; senderName: string },
  ) {
    return this.documentsService.createDossierFromTemplate(
      body,
      this.getGrpcMetadata(req),
    );
  }

  @Post('dossiers/create-blank')
  async createBlankDossier(
    @Req() req: any,
    @Body() body: { procedureName: string; senderName: string },
  ) {
    return this.documentsService.createBlankDossier(
      body,
      this.getGrpcMetadata(req),
    );
  }

  @Post('dossiers/:id/components')
  async addComponentFromCabinet(
    @Req() req: any,
    @Param('id') dossierId: string,
    @Body() body: { name: string; fileUrl: string },
  ) {
    return this.documentsService.addComponentFromCabinet(
      dossierId,
      body,
      this.getGrpcMetadata(req),
    );
  }

  // --- LGSP Interoperability Endpoints ---
  @Post('lgsp/sync')
  async syncLgsp(@Req() req: any) {
    return this.documentsService.syncLgsp(req?.user, this.getGrpcMetadata(req));
  }

  @Get('lgsp/agencies')
  async getLgspAgencies(@Req() req: any, @Query() query: any) {
    return this.documentsService.getLgspAgencies(
      query,
      this.getGrpcMetadata(req),
    );
  }

  @Get('lgsp/config')
  async getLgspConfig(@Req() req: any) {
    return this.documentsService.getLgspConfig(this.getGrpcMetadata(req));
  }

  @Post('lgsp/config')
  async updateLgspConfig(@Req() req: any, @Body() body: any) {
    return this.documentsService.updateLgspConfig(
      body,
      this.getGrpcMetadata(req),
    );
  }

  @Get('lgsp/test-connection')
  async testLgspConnection(@Req() req: any) {
    return this.documentsService.testLgspConnection(this.getGrpcMetadata(req));
  }

  @Post(':id/send-lgsp')
  async sendLgspDocument(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { receiverCode: string },
  ) {
    return this.documentsService.sendLgspDocument(
      id,
      body,
      req?.user,
      this.getGrpcMetadata(req),
    );
  }

  @Get(':id/lgsp-status')
  async getLgspSentStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Query('lgspDocId') lgspDocId?: string,
  ) {
    return this.documentsService.getLgspSentStatus(
      id,
      lgspDocId,
      this.getGrpcMetadata(req),
    );
  }

  @Get(':id')
  async getDocument(@Req() req: any, @Param('id') id: string) {
    return this.documentsService.getDocument(id, this.getGrpcMetadata(req));
  }

  @Post()
  async createDocument(@Req() req: any, @Body() body: any) {
    return this.documentsService.createDocument(
      req.user,
      body,
      this.getGrpcMetadata(req),
    );
  }

  @Put(':id')
  async updateDocument(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.documentsService.updateDocument(
      id,
      req.user,
      body,
      this.getGrpcMetadata(req),
    );
  }

  @Post(':id/process')
  async processDocument(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { note?: string },
  ) {
    return this.documentsService.processDocument(
      id,
      req.user,
      body,
      this.getGrpcMetadata(req),
    );
  }

  @Post(':id/finalize')
  async finalizeDocument(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { note?: string },
  ) {
    return this.documentsService.finalizeDocument(
      id,
      req.user,
      body,
      this.getGrpcMetadata(req),
    );
  }

  @Post('extract')
  async extractMetadata(@Req() req: any, @Body() body: { fileId: string }) {
    return this.documentsService.extractMetadata(
      body,
      this.getGrpcMetadata(req),
    );
  }

  @Get(':id/logs')
  async getDocumentLogs(@Req() req: any, @Param('id') id: string) {
    return this.documentsService.getDocumentLogs(id, this.getGrpcMetadata(req));
  }

  @Delete(':id')
  async deleteDocument(@Req() req: any, @Param('id') id: string) {
    return this.documentsService.deleteDocument(id, this.getGrpcMetadata(req));
  }
}
