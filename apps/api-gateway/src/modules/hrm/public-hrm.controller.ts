import {
  Controller,
  Get,
  Query,
  Inject,
  OnModuleInit,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@ApiTags('Public HRM')
@Controller('public/hrm/employees')
export class PublicHrmController implements OnModuleInit {
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
    if (req.ids) {
      req.ids =
        typeof req.ids === 'string'
          ? req.ids
              .split(',')
              .map((id: string) => parseInt(id, 10))
              .filter((id: number) => !isNaN(id))
          : req.ids;
    }

    const response = await firstValueFrom(
      this.employeeService.ListEmployees(req),
    ).catch((e) => this.handleRpcError(e));
    return response;
  }
}
