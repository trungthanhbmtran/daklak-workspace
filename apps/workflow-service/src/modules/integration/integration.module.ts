import { Module } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IntegrationController],
  providers: [IntegrationService],
  exports: [IntegrationService],
})
export class IntegrationModule {}
