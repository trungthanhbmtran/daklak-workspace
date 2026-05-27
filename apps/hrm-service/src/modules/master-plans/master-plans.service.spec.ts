import { Test, TestingModule } from '@nestjs/testing';
import { MasterPlansService } from './master-plans.service';

describe('MasterPlansService', () => {
  let service: MasterPlansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MasterPlansService],
    }).compile();

    service = module.get<MasterPlansService>(MasterPlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
