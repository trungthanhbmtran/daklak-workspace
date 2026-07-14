import { Module } from '@nestjs/common';
import { IntegrationService } from '../../application/services/integration.service';
import { IntegrationController } from '../../presentation/controllers/integration.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IntegrationController],
  providers: [IntegrationService],
  exports: [IntegrationService],
})
export class IntegrationModule {}
