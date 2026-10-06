import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Inject,
  OnModuleInit,
  UseGuards,
  Put,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException, ForbiddenException} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';

@ApiTags('HRM - Task Templates')
@Controller('admin/hrm/task-templates')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class TaskTemplatesController implements OnModuleInit {
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

  private taskTemplateService: any;

  constructor(
    @Inject(MICROSERVICES.TASK.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.taskTemplateService = this.client.getService('TaskService');
  }

  @Get()
  async findAll(
    @Query('classification') classification?: string,
    @Query('rank') rank?: string,
  ) {
    return firstValueFrom(
      this.taskTemplateService.FindTaskTemplates({ classification, rank }),
    ).catch((e) => this.handleRpcError(e));
  }

  @Post()
  async create(@Body() body: any) {
    return firstValueFrom(
      this.taskTemplateService.CreateTaskTemplate(body),
    ).catch((e) => this.handleRpcError(e));
  }

  @Post('bulk')
  async bulkUpdate(@Body() body: any) {
    return firstValueFrom(
      this.taskTemplateService.BulkUpdateTaskTemplates({
        templates: body.templates,
      }),
    ).catch((e) => this.handleRpcError(e));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(
      this.taskTemplateService.UpdateTaskTemplate({ id: Number(id), ...body }),
    ).catch((e) => this.handleRpcError(e));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return firstValueFrom(
      this.taskTemplateService.DeleteTaskTemplate({ id: Number(id) }),
    ).catch((e) => this.handleRpcError(e));
  }
}
