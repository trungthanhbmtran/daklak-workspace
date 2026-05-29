import { Test, TestingModule } from '@nestjs/testing';
import { RankQuotasService } from './rank-quotas.service';

describe('RankQuotasService', () => {
  let service: RankQuotasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RankQuotasService],
    }).compile();

    service = module.get<RankQuotasService>(RankQuotasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
