import { Module } from '@nestjs/common';
import { UserConfigsService } from './user-configs.service';
import { UserConfigsController } from './user-configs.controller';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserConfigsController],
  providers: [UserConfigsService],
  exports: [UserConfigsService],
})
export class UserConfigsModule { }
