import { Module } from '@nestjs/common';
import { PbacService } from './pbac.service';
import { PbacController } from './pbac.controller';

@Module({
  controllers: [PbacController],
  providers: [PbacService],
  exports: [PbacService],
})
export class PbacModule {}
