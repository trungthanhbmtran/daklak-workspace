import { Controller, Get, Query, Inject, OnModuleInit } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@ApiTags('Public HRM')
@Controller('public/hrm/employees')
export class PublicHrmController implements OnModuleInit {
  private employeeService: any;

  constructor(
    @Inject(MICROSERVICES.EMPLOYEE.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.employeeService = this.client.getService(
      MICROSERVICES.EMPLOYEE.SERVICE,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách cán bộ, lãnh đạo xã' })
  async list(@Query() query: any) {
    const req = { ...query };
    if (req.page) req.page = parseInt(req.page);
    if (req.pageSize) req.pageSize = parseInt(req.pageSize);
    if (req.departmentId) req.departmentId = parseInt(req.departmentId);

    const response = await firstValueFrom(
      this.employeeService.ListEmployees(req),
    );
    return response;
  }
}
