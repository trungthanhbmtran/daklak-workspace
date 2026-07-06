import { Module } from '@nestjs/common';
import { TaskCatalogController } from './task-catalog.controller';
import { TaskCatalogService } from './task-catalog.service';

@Module({
  controllers: [TaskCatalogController],
  providers: [TaskCatalogService],
})
export class TaskCatalogModule {}
