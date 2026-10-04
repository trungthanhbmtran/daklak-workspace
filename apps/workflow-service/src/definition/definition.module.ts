import { Module } from "@nestjs/common";
import { DefinitionService } from "./definition.service";
import { DefinitionController } from "./definition.controller";
import { DefinitionValidatorService } from "./definition-validator.service";

@Module({
  controllers: [DefinitionController],
  providers: [DefinitionService, DefinitionValidatorService],
  exports: [DefinitionService, DefinitionValidatorService],
})
export class DefinitionModule {}
