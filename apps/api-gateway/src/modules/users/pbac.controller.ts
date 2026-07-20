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
  OnModuleInit,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';

@ApiTags('PBAC – Chính sách phân quyền')
@Controller('admin/roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class PbacController implements OnModuleInit {
  private pbacService: any;

  constructor(
    @Inject(MICROSERVICES.PBAC.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.pbacService = this.client.getService(MICROSERVICES.PBAC.SERVICE);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách vai trò' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách vai trò (cả số người dùng, số chính sách)',
  })
  async findAll() {
    return firstValueFrom(this.pbacService.FindAllRoles({})).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết một vai trò (kèm danh sách chính sách)',
  })
  @ApiResponse({
    status: 200,
    description: 'Vai trò và danh sách chính sách',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.pbacService.FindOneRole({ id })).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  @Post()
  @ApiOperation({ summary: 'Tạo vai trò mới' })
  @ApiResponse({ status: 201, description: 'Vai trò vừa được tạo (camelCase)' })
  async create(
    @Body()
    body: {
      code: string;
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
    return firstValueFrom(
      this.pbacService.CreateRole({
        code: body.code,
        name: body.name,
        description: body.description,
        policies: body.policies,
      }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật vai trò' })
  @ApiResponse({
    status: 200,
    description: 'Vai trò sau khi cập nhật (camelCase)',
  })
  async update(
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
    return firstValueFrom(
      this.pbacService.UpdateRole({
        id,
        name: body.name,
        description: body.description,
        policies: body.policies,
      }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xoá vai trò (không xoá được khi có user được gán)',
  })
  @ApiResponse({ status: 200, description: 'Đã xoá' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.pbacService.DeleteRole({ id })).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }
}
