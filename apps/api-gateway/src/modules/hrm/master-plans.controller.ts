import { Controller, Get, Post, Put, Delete, Param, Body, Query, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('admin/hrm/master-plans')
export class MasterPlansController implements OnModuleInit {
  private masterPlanService: any;

  constructor(@Inject('MASTER_PLAN_PACKAGE') private client: any) {}

  onModuleInit() {
    this.masterPlanService = this.client.getService('MasterPlanService') as any;
  }

  @Get()
  async findAll(@Query('type') type?: string, @Query('status') status?: string) {
    const response = (await firstValueFrom(this.masterPlanService.FindAll({ type, status }))) as any;
    return {
      status: 'success',
      data: response.masterPlans || [],
      message: 'Lấy danh sách Kế hoạch thành công'
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = (await firstValueFrom(this.masterPlanService.FindById({ id: parseInt(id, 10) }))) as any;
    return { status: 'success', data };
  }

  @Post()
  async create(@Body() body: any) {
    const data = (await firstValueFrom(this.masterPlanService.Create(body))) as any;
    return { status: 'success', data, message: 'Tạo Kế hoạch thành công' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const data = (await firstValueFrom(this.masterPlanService.Update({ id: parseInt(id, 10), ...body }))) as any;
    return { status: 'success', data, message: 'Cập nhật Kế hoạch thành công' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = (await firstValueFrom(this.masterPlanService.Delete({ id: parseInt(id, 10) }))) as any;
    return { status: 'success', data, message: 'Xóa Kế hoạch thành công' };
  }
}
