import { Module } from '@nestjs/common';
import { LgspConfigService } from './lgsp.config';
import { LgspTokenService } from './lgsp-token.service';
import { LgspService } from './lgsp.service';
import { LgspController } from './lgsp.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LgspController],
  providers: [LgspConfigService, LgspTokenService, LgspService],
  exports: [LgspService, LgspConfigService, LgspTokenService],
})
export class LgspModule {}
