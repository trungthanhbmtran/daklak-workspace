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
    this.taskTemplateService = this.client.getService('TaskTemplateService');
  }

  @Get()
  async findAll(
    @Query('classification') classification?: string,
    @Query('rank') rank?: string,
  ) {
    return firstValueFrom(
      this.taskTemplateService.FindAll({ classification, rank }),
    );
  }

  @Post()
  async create(@Body() body: any) {
    return firstValueFrom(this.taskTemplateService.Create(body));
  }

  @Post('bulk')
  async bulkUpdate(@Body() body: any) {
    return firstValueFrom(
      this.taskTemplateService.BulkUpdate({ templates: body.templates }),
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(
      this.taskTemplateService.Update({ id: Number(id), ...body }),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return firstValueFrom(this.taskTemplateService.Delete({ id: Number(id) }));
  }
}
