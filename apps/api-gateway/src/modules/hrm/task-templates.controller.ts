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
  InternalServerErrorException
} from '@nestjs/common';
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
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  @Post()
  async create(@Body() body: any) {
    return firstValueFrom(
      this.taskTemplateService.CreateTaskTemplate(body),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  @Post('bulk')
  async bulkUpdate(@Body() body: any) {
    return firstValueFrom(
      this.taskTemplateService.BulkUpdateTaskTemplates({
        templates: body.templates,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(
      this.taskTemplateService.UpdateTaskTemplate({ id: Number(id), ...body }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return firstValueFrom(
      this.taskTemplateService.DeleteTaskTemplate({ id: Number(id) }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }
}
