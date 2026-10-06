import { Module } from "@nestjs/common";
import { DefinitionService } from "./definition.service";
import { DefinitionValidatorService } from "./definition-validator.service";

@Module({
  controllers: [],
  providers: [DefinitionService, DefinitionValidatorService],
  exports: [DefinitionService, DefinitionValidatorService],
})
export class DefinitionModule {}
