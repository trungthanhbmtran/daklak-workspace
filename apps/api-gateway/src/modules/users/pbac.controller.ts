import { Controller, Get, Post, Put, Delete, Body, Param, Inject, UseGuards, OnModuleInit, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('PBAC – Chính sách phân quyền')
@Controller('admin/roles')
@UseGuards(JwtAuthGuard)
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
  @ApiResponse({ status: 200, description: 'Danh sách vai trò (có số user, số quyền)' })
  async findAll() {
    return firstValueFrom(this.pbacService.FindAllRoles({}));
  }

  @Get('permissions/matrix')
  @ApiOperation({ summary: 'Ma trận quyền (Resource -> Permissions) cho UI cấp quyền' })
  @ApiResponse({ status: 200, description: 'Danh sách Resource, mỗi resource có danh sách Permission' })
  getPermissionMatrix() {
    return firstValueFrom(this.pbacService.GetPermissionMatrix({}));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một vai trò (kèm danh sách quyền)' })
  @ApiResponse({ status: 200, description: 'Vai trò và danh sách permission' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.pbacService.FindOneRole({ id }));
  }

  @Post()
  @ApiOperation({ summary: 'Tạo vai trò mới' })
  @ApiResponse({ status: 201, description: 'Vai trò vừa tạo (camelCase)' })
  async create(@Body() body: { code: string; name: string; description?: string; permissionIds?: number[] }) {
    return firstValueFrom(this.pbacService.CreateRole({
      code: body.code,
      name: body.name,
      description: body.description,
      permissionIds: body.permissionIds,
    }));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật vai trò' })
  @ApiResponse({ status: 200, description: 'Vai trò sau khi cập nhật (camelCase)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; description?: string; permissionIds?: number[] },
  ) {
    return firstValueFrom(this.pbacService.UpdateRole({
      id,
      name: body.name,
      description: body.description,
      permissionIds: body.permissionIds,
    }));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa vai trò (không xóa được nếu còn user đang gán)' })
  @ApiResponse({ status: 200, description: 'Đã xóa' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.pbacService.DeleteRole({ id }));
  }
}
