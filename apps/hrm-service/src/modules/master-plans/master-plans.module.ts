import { Module } from '@nestjs/common';
import { MasterPlansController } from './master-plans.controller';
import { MasterPlansService } from './master-plans.service';

@Module({
  controllers: [MasterPlansController],
  providers: [MasterPlansService]
})
export class MasterPlansModule {}
