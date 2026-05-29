import { Module } from '@nestjs/common';
import { RankQuotasService } from './rank-quotas.service';
import { RankQuotasController } from './rank-quotas.controller';

@Module({
  providers: [RankQuotasService],
  controllers: [RankQuotasController]
})
export class RankQuotasModule {}
