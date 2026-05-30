import { Module } from '@nestjs/common';
import { LgspController } from './lgsp.controller';
import { LgspService } from './lgsp.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '@/database/prisma.service';

@Module({
  imports: [HttpModule],
  controllers: [LgspController],
  providers: [LgspService, PrismaService],
})
export class LgspModule {}
