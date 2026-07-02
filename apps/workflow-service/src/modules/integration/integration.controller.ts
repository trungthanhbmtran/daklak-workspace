/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, prettier/prettier, @typescript-eslint/require-await */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { IntegrationService } from './integration.service';

@Controller('integration-configs')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.integrationService.create(createDto);
  }

  @Get()
  findAll() {
    return this.integrationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.integrationService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.integrationService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.integrationService.remove(id);
  }

  @Post('import/postman')
  importPostman(@Body('jsonString') jsonString: string) {
    return this.integrationService.parsePostmanCollection(jsonString);
  }

  @Post('import/swagger')
  importSwagger(@Body('jsonString') jsonString: string) {
    return this.integrationService.parseSwagger(jsonString);
  }

  @Post(':code/execute')
  execute(@Param('code') code: string, @Body() payload: any) {
    return this.integrationService.executeIntegration(
      code,
      payload.endpointPath,
      payload,
    );
  }
}
