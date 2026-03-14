import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, UseGuards, OnModuleInit } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('HRM')
@Controller('admin/hrm/employees')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class EmployeeController implements OnModuleInit {
  private employeeService: any;

  constructor(
    @Inject(MICROSERVICES.EMPLOYEE.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.employeeService = this.client.getService(MICROSERVICES.EMPLOYEE.SERVICE);
  }

  @Get()
  async list(@Query() query: any) {
    const req = { ...query };
    if (req.page) req.page = parseInt(req.page);
    if (req.pageSize) req.pageSize = parseInt(req.pageSize);
    if (req.departmentId) req.departmentId = parseInt(req.departmentId);
    return firstValueFrom(this.employeeService.ListEmployees(req));
  }

  @Get(':id')
  async getDetail(@Param('id') id: string) {
    return firstValueFrom(this.employeeService.GetEmployee({ id: parseInt(id) }));
  }

  @Post()
  async create(@Body() body: any) {
    return firstValueFrom(this.employeeService.CreateEmployee(body));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const payload = { ...body, id: parseInt(id) };
    return firstValueFrom(this.employeeService.UpdateEmployee(payload));
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return firstValueFrom(this.employeeService.DeleteEmployee({ id: parseInt(id) }));
  }
}
