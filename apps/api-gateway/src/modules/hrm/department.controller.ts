import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, UseGuards, OnModuleInit, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

/** Flatten tree to list (id, code, name, ...) */
function flattenUnits(nodes: any[]): any[] {
  let out: any[] = [];
  for (const n of nodes || []) {
    const { children, ...rest } = n;
    out.push(rest);
    out = out.concat(flattenUnits(children || []));
  }
  return out;
}

@ApiTags('HRM')
@Controller('admin/hrm/departments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DepartmentController implements OnModuleInit {
  private orgService: any;

  constructor(
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly orgClient: any,
    @Inject(MICROSERVICES.EMPLOYEE.SYMBOL) private readonly employeeClient: any,
  ) {}

  onModuleInit() {
    this.orgService = this.orgClient.getService(MICROSERVICES.ORGANIZATION.SERVICE);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Cây sơ đồ tổ chức (user-service)' })
  async getTree(@Query('rootId') rootId?: string) {
    if (rootId && rootId !== '0') {
      const id = parseInt(rootId, 10);
      if (!Number.isNaN(id)) {
        const res = await firstValueFrom(this.orgService.GetSubTree({ id }));
        return { nodes: (res as any).nodes ?? [] };
      }
    }
    const res = await firstValueFrom(this.orgService.GetFullTree({}));
    return res;
  }

  @Post('move')
  @ApiOperation({ summary: 'Chuyển đơn vị sang đơn vị cha mới (user-service UpdateUnit parentId)' })
  async move(@Body() body: { id: number; newParentId?: number }) {
    const id = body.id;
    const newParentId = body.newParentId ?? null;
    return firstValueFrom(this.orgService.UpdateUnit({ id, parentId: newParentId === 0 ? null : newParentId }));
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách đơn vị (flatten từ cây, user-service)' })
  async list(@Query() query: any) {
    const res = await firstValueFrom(this.orgService.GetFullTree({})) as { nodes?: any[] };
    const all = flattenUnits(res.nodes ?? []);
    let list = all;
    const parentId = query.parentId != null ? parseInt(query.parentId, 10) : undefined;
    if (parentId !== undefined && !Number.isNaN(parentId)) {
      list = list.filter((u: any) => (u.parentId ?? 0) === parentId);
    }
    const keyword = (query.keyword || '').trim().toLowerCase();
    if (keyword) {
      list = list.filter((u: any) =>
        (u.name && u.name.toLowerCase().includes(keyword)) ||
        (u.code && u.code.toLowerCase().includes(keyword)),
      );
    }
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 10));
    const start = (page - 1) * pageSize;
    const slice = list.slice(start, start + pageSize);
    return {
      data: slice,
      meta: {
        pagination: {
          total: list.length,
          page,
          pageSize,
          totalPages: Math.ceil(list.length / pageSize),
          hasNext: start + pageSize < list.length,
          hasPrev: page > 1,
        },
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết đơn vị (user-service)' })
  async getDetail(@Param('id') id: string) {
    const res = await firstValueFrom(this.orgService.GetOne({ id: parseInt(id, 10) }));
    return res;
  }

  @Get(':id/employees')
  @ApiOperation({ summary: 'Nhân viên thuộc đơn vị (hrm-service)' })
  async listEmployees(@Param('id') id: string, @Query() query: any) {
    const svc = this.employeeClient.getService(MICROSERVICES.EMPLOYEE.SERVICE);
    const req = { ...query, departmentId: parseInt(id, 10) };
    return firstValueFrom(svc.ListEmployees(req));
  }

  @Post()
  @ApiOperation({ summary: 'Tạo đơn vị (user-service)' })
  async create(@Body() body: any) {
    const payload = {
      code: body.code,
      name: body.name,
      shortName: body.shortName,
      typeId: body.typeId ?? 0,
      parentId: body.parentId != null ? body.parentId : undefined,
      domainIds: body.domainIds ?? [],
      scope: body.scope,
    };
    return firstValueFrom(this.orgService.CreateUnit(payload));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật đơn vị (user-service)' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const payload: any = { id };
    if (body.code !== undefined) payload.code = body.code;
    if (body.name !== undefined) payload.name = body.name;
    if (body.shortName !== undefined) payload.shortName = body.shortName;
    if (body.typeId !== undefined) payload.typeId = body.typeId;
    if (body.parentId !== undefined) payload.parentId = body.parentId;
    if (body.domainIds !== undefined) payload.domainIds = body.domainIds;
    if (body.scope !== undefined) payload.scope = body.scope;
    return firstValueFrom(this.orgService.UpdateUnit(payload));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa đơn vị (user-service)' })
  async delete(@Param('id') id: string) {
    const res = await firstValueFrom(this.orgService.DeleteUnit({ id: parseInt(id, 10) })) as { success?: boolean; message?: string };
    return res ?? { success: true, message: 'Đã xóa đơn vị' };
  }
}
