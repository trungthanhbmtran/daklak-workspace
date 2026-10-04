import { Module } from "@nestjs/common";
import { PrismaModule } from "../infra/prisma.module";
import { ProcessCatalogService } from "./process-catalog.service";
import { BindingService } from "./binding.service";

@Module({
  imports: [PrismaModule],
  providers: [ProcessCatalogService, BindingService],
  exports: [ProcessCatalogService, BindingService],
})
export class CatalogModule {}
