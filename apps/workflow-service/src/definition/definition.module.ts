import { Module } from '@nestjs/common';
import { DefinitionService } from './definition.service';
import { DefinitionController } from './definition.controller';

@Module({
  controllers: [DefinitionController],
  providers: [DefinitionService],
  exports: [DefinitionService],
})
export class DefinitionModule {}
