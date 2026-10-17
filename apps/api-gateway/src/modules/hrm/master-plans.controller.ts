import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';
import { MasterPlansService } from './master-plans.service';

@ApiTags('HRM - Master Plans')
@ApiBearerAuth('JWT-auth')
@Controller('admin/hrm/master-plans')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MasterPlansController {
  constructor(
    private readonly masterPlansService: MasterPlansService,
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
  async findAll(
    @Req() req: any,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('departmentId') reqDepartmentId?: string,
  ) {
    return this.masterPlansService.findAll(
      req.user,
      type,
      status,
      reqDepartmentId,
      this.getGrpcMetadata(req),
    );
  }

  @Get(':id')
  async findById(@Req() req: any, @Param('id') id: string) {
    return this.masterPlansService.findById(
      req.user,
      id,
      this.getGrpcMetadata(req),
    );
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    return this.masterPlansService.create(
      req.user,
      body,
      this.getGrpcMetadata(req),
    );
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.masterPlansService.update(
      req.user,
      id,
      body,
      this.getGrpcMetadata(req),
    );
  }
}
