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
import { RequirePermissions } from '../../core/decorators/permissions.decorator';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';
import { EmployeeService } from './employee.service';

@ApiTags('HRM')
@Controller('admin/hrm/employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
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
  @RequirePermissions('HRM_EMPLOYEE:VIEW')
  async list(@Query() query: any, @Req() req: any) {
    return this.employeeService.list(req.user, query, this.getGrpcMetadata(req));
  }

  @Get(':id')
  @RequirePermissions('HRM_EMPLOYEE:VIEW')
  async getDetail(@Req() req: any, @Param('id') id: string) {
    return this.employeeService.getDetail(id, this.getGrpcMetadata(req));
  }

  @Post()
  @RequirePermissions('HRM_EMPLOYEE:CREATE')
  async create(@Req() req: any, @Body() body: any) {
    return this.employeeService.create(body, this.getGrpcMetadata(req));
  }

  @Put(':id')
  @RequirePermissions('HRM_EMPLOYEE:UPDATE')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.employeeService.update(id, body, this.getGrpcMetadata(req));
  }

  @Delete(':id')
  @RequirePermissions('HRM_EMPLOYEE:DELETE')
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.employeeService.delete(id, this.getGrpcMetadata(req));
  }
}
