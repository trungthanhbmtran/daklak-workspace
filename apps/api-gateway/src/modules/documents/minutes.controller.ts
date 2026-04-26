import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, OnModuleInit } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import * as microservices from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@ApiTags('Documents')
@Controller('admin/documents/minutes')
export class MinutesController implements OnModuleInit {
  private minutesService: any;

  constructor(
    @Inject(MICROSERVICES.MINUTES.SYMBOL) private readonly client: microservices.ClientGrpc,
  ) { }

  onModuleInit() {
    this.minutesService = this.client.getService(MICROSERVICES.MINUTES.SERVICE);
  }

  @Get()
  @ApiOperation({ summary: 'List meeting minutes' })
  async listMinutes(@Query() query: any) {
    return firstValueFrom(this.minutesService.ListMinutes(query));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get minutes detail' })
  async getMinutes(@Param('id') id: string) {
    return firstValueFrom(this.minutesService.GetMinutes({ id }));
  }

  @Post()
  @ApiOperation({ summary: 'Create meeting minutes' })
  async createMinutes(@Body() body: any) {
    return firstValueFrom(this.minutesService.CreateMinutes(body));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update meeting minutes' })
  async updateMinutes(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.minutesService.UpdateMinutes({ id, ...body }));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete meeting minutes' })
  async deleteMinutes(@Param('id') id: string) {
    return firstValueFrom(this.minutesService.DeleteMinutes({ id }));
  }
}
