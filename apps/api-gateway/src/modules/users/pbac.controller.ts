import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  UseGuards,
  Req,
  OnModuleInit,
  ParseIntPipe,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';

@ApiTags('PBAC – Chính sách phân quyền')
@Controller('admin/policys')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class PbacController implements OnModuleInit {
  private handleRpcError(e: any, defaultMsg = 'RPC Call Failed'): never {
    const code = e?.code;
    const message = e?.details || e?.message || defaultMsg;
    if (code === 16) throw new UnauthorizedException(message);
    if (code === 7) throw new ForbiddenException(message);
    if (code === 5) throw new NotFoundException(message);
    if (code === 6) throw new ConflictException(message);
    if (code === 3) throw new BadRequestException(message);
    throw new InternalServerErrorException(message);
  }

  private pbacService: any;

  constructor(
    @Inject(MICROSERVICES.PBAC.SYMBOL) private readonly client: any,
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

  onModuleInit() {
    this.pbacService = this.client.getService(MICROSERVICES.PBAC.SERVICE);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách nhóm quyền' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách nhóm quyền (cả số người dùng, số chính sách)',
  })
  async findAll(@Req() req: any) {
    const result: any = await firstValueFrom(
      this.pbacService.FindAllUserGroups({}, this.getGrpcMetadata(req)),
    ).catch((e) => this.handleRpcError(e));
    return { data: result?.userGroups || [] };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết một nhóm quyền (kèm danh sách chính sách)',
  })
  @ApiResponse({
    status: 200,
    description: 'Nhóm quyền và danh sách chính sách',
  })
  async findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const result: any = await firstValueFrom(
      this.pbacService.FindOneUserGroup({ id }, this.getGrpcMetadata(req)),
    ).catch((e) => this.handleRpcError(e));
    if (result && result.policies) {
      result.policies = result.policies.map((p: any) => {
        let parsedConditions = { expression: '' };
        if (typeof p.conditions === 'string' && p.conditions.trim()) {
          try {
            parsedConditions = JSON.parse(p.conditions);
          } catch (e) {
            parsedConditions = { expression: p.conditions };
          }
        } else if (typeof p.conditions === 'object') {
          parsedConditions = p.conditions;
        }
        return {
          ...p,
          resourceId: p.resourceId ?? p.resource_id,
          resourceCode: p.resourceCode || p.resource_code || p.resource?.code || '',
          conditions: parsedConditions,
        };
      });
    }
    return { data: result };
  }

  @Post()
  @ApiOperation({ summary: 'Tạo nhóm quyền mới' })
  @ApiResponse({ status: 201, description: 'Nhóm quyền vừa được tạo' })
  async create(
    @Req() req: any,
    @Body()
    body: {
      name: string;
      description?: string;
      policies?: {
        resourceId: number;
        action: string;
        effect?: string;
        conditions?: string;
      }[];
    },
  ) {
    const policies = (body.policies || []).map((p: any) => ({
      ...p,
      conditions: p.conditions ? JSON.stringify(p.conditions) : '',
    }));
    const result = await firstValueFrom(
      this.pbacService.CreateUserGroup(
        {
          name: body.name,
          description: body.description,
          policies,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    return { data: result };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật nhóm quyền' })
  @ApiResponse({
    status: 200,
    description: 'Nhóm quyền sau khi cập nhật',
  })
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string;
      description?: string;
      policies?: {
        resourceId: number;
        action: string;
        effect?: string;
        conditions?: string;
      }[];
    },
  ) {
    const policies = (body.policies || []).map((p: any) => ({
      ...p,
      conditions: p.conditions ? JSON.stringify(p.conditions) : '',
    }));
    const result = await firstValueFrom(
      this.pbacService.UpdateUserGroup(
        {
          id,
          name: body.name,
          description: body.description,
          policies,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    return { data: result };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xoá nhóm quyền',
  })
  @ApiResponse({ status: 200, description: 'Đã xoá' })
  async delete(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.pbacService.DeleteUserGroup({ id }, this.getGrpcMetadata(req)),
    ).catch((e) => this.handleRpcError(e));
    return { data: result };
  }
}
