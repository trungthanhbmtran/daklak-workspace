import { Test, TestingModule } from '@nestjs/testing';
import { KpiEvaluationsController } from './kpi-evaluations.controller';

describe('KpiEvaluationsController', () => {
  let controller: KpiEvaluationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KpiEvaluationsController],
    }).compile();

    controller = module.get<KpiEvaluationsController>(KpiEvaluationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
