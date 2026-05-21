import { Test, TestingModule } from '@nestjs/testing';
import { KpisService } from './kpis.service';

describe('KpisService', () => {
  let service: KpisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KpisService],
    }).compile();

    service = module.get<KpisService>(KpisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
