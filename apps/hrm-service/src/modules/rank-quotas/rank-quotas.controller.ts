import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RankQuotasService } from './rank-quotas.service';

@Controller()
export class RankQuotasController {
  constructor(private readonly rankQuotasService: RankQuotasService) {}

  @GrpcMethod('RankQuotaService', 'SaveRankQuotas')
  saveRankQuotas(data: any) {
    return this.rankQuotasService.SaveRankQuotas(data);
  }

  @GrpcMethod('RankQuotaService', 'GetRankQuotasByRank')
  getRankQuotasByRank(data: any) {
    return this.rankQuotasService.GetRankQuotasByRank(data);
  }
}
