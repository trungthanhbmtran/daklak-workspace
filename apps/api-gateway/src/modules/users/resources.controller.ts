import { Controller, Get, Post, Put, Delete, Body, Param, Inject, UseGuards, OnModuleInit, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('PBAC – Tài nguyên')
@Controller('admin/resources')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ResourcesController implements OnModuleInit {
  private pbacService: any;

  constructor(
    @Inject(MICROSERVICES.PBAC.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.pbacService = this.client.getService(MICROSERVICES.PBAC.SERVICE);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo tài nguyên mới' })
  @ApiResponse({ status: 201, description: 'Tài nguyên vừa tạo' })
  async createResource(@Body() body: { code: string; name: string }) {
    return firstValueFrom(this.pbacService.CreateResource({ code: body.code, name: body.name }));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật tài nguyên' })
  @ApiResponse({ status: 200, description: 'Tài nguyên sau khi cập nhật' })
  async updateResource(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { code?: string; name?: string },
  ) {
    return firstValueFrom(this.pbacService.UpdateResource({ id, code: body.code, name: body.name }));
  }

  @Delete('permissions/:id')
  @ApiOperation({ summary: 'Xóa một quyền theo id' })
  @ApiResponse({ status: 200, description: 'Kết quả xóa' })
  async deletePermission(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.pbacService.DeletePermission({ id }));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tài nguyên (chỉ khi không còn permission nào)' })
  @ApiResponse({ status: 200, description: 'Kết quả xóa' })
  async deleteResource(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.pbacService.DeleteResource({ id }));
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Thêm quyền (action) cho tài nguyên' })
  @ApiResponse({ status: 201, description: 'Permission vừa tạo' })
  async createPermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { action: string },
  ) {
    return firstValueFrom(this.pbacService.CreatePermission({ resourceId: id, action: body.action }));
  }
}
