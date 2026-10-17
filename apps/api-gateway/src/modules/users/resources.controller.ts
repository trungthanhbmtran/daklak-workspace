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

@ApiTags('PBAC – Tài nguyên')
@Controller('admin/resources')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class ResourcesController implements OnModuleInit {
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
    @Inject(MICROSERVICES.PBAC.SYMBOL)
    private readonly client: any,
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

  /**
   * GET /admin/resources
   * Trả danh sách PBAC Resource phẳng — dùng cho dropdown menu form
   * Chuẩn PBAC: menu gắn với resource thay vì danh sách permission IDs
   */
  @Get()
  @ApiOperation({ summary: 'Danh sách PBAC Resource (dùng cho menu form)' })
  @ApiResponse({ status: 200, description: 'Mảng resources phẳng' })
  async listResources(@Req() req: any) {
    const res = (await firstValueFrom(
      this.pbacService.GetResources({}, this.getGrpcMetadata(req)),
    ).catch(
      (e) => {
        throw new InternalServerErrorException(e.message || 'RPC Call Failed');
      },
    )) as any;
    const rawResources = res?.resources ?? res?.data?.resources ?? [];

    const resources = rawResources.map((r: any) => ({
      id: r.id,
      code: r.code ?? '',
      name: r.name ?? r.code ?? '',
      serviceCode: r.serviceCode ?? null,
    }));
    return resources;
  }

  @Get('permission-matrix')
  @ApiOperation({ summary: 'Danh sách quyền phẳng (dùng cho form policies)' })
  @ApiResponse({ status: 200, description: 'Mảng permissions phẳng' })
  async getPermissionMatrix(@Req() req: any) {
    const res = (await firstValueFrom(
      this.pbacService.GetResources({}, this.getGrpcMetadata(req)),
    ).catch(
      (e) => {
        throw new InternalServerErrorException(e.message || 'RPC Call Failed');
      },
    )) as any;
    const rawResources = res?.resources ?? res?.data?.resources ?? [];
    const out: any[] = [];
    const STD_ACTIONS = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE'];
    for (const r of rawResources) {
      for (const action of STD_ACTIONS) {
        out.push({
          id: r.id,
          module: r.name ?? r.code ?? '',
          action: action,
          code: `${r.code}:${action}`,
          resourceCode: r.code ?? '',
        });
      }
    }
    return out;
  }

  @Post()
  @ApiOperation({ summary: 'Tạo tài nguyên mới' })
  @ApiResponse({ status: 201, description: 'Tài nguyên vừa được tạo' })
  async createResource(
    @Req() req: any,
    @Body() body: { code: string; name: string; serviceCode?: string },
  ) {
    const result = await firstValueFrom(
      this.pbacService.CreateResource(
        {
          code: body.code,
          name: body.name,
          serviceCode: body.serviceCode,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    return result;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật tài nguyên' })
  @ApiResponse({ status: 200, description: 'Tài nguyên sau khi cập nhật' })
  async updateResource(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { code?: string; name?: string; serviceCode?: string },
  ) {
    const result = await firstValueFrom(
      this.pbacService.UpdateResource(
        {
          id,
          code: body.code,
          name: body.name,
          serviceCode: body.serviceCode,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    return result;
  }
}
