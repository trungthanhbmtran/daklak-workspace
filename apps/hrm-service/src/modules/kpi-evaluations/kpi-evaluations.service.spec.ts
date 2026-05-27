import { Test, TestingModule } from '@nestjs/testing';
import { KpiEvaluationsService } from './kpi-evaluations.service';

describe('KpiEvaluationsService', () => {
  let service: KpiEvaluationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KpiEvaluationsService],
    }).compile();

    service = module.get<KpiEvaluationsService>(KpiEvaluationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
