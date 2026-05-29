import { Controller, Post, Get, Body, Param, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { MICROSERVICES } from '../../core/constants/services';
import { firstValueFrom } from 'rxjs';

@Controller('admin/hrm/rank-quotas')
export class RankQuotasController {
  private rankQuotaService: any;

  constructor(
    @Inject(MICROSERVICES.RANK_QUOTA.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.rankQuotaService = this.client.getService(
      MICROSERVICES.RANK_QUOTA.SERVICE,
    );
  }

  @Post()
  async saveRankQuotas(@Body() body: any) {
    const data = await firstValueFrom(this.rankQuotaService.SaveRankQuotas(body));
    return data;
  }

  @Get(':rankCode')
  async getRankQuotasByRank(@Param('rankCode') rankCode: string) {
    const data = await firstValueFrom(this.rankQuotaService.GetRankQuotasByRank({ rankCode }));
    return data;
  }
}
