import { Module } from '@nestjs/common';
import { MinutesController } from './minutes.controller';
import { MinutesService } from './minutes.service';

@Module({
  controllers: [MinutesController],
  providers: [MinutesService],
})
export class MinutesModule {}
