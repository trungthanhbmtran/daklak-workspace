import { Test, TestingModule } from '@nestjs/testing';
import { RankQuotasController } from './rank-quotas.controller';

describe('RankQuotasController', () => {
  let controller: RankQuotasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankQuotasController],
    }).compile();

    controller = module.get<RankQuotasController>(RankQuotasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
