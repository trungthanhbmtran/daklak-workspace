import { Test, TestingModule } from '@nestjs/testing';
import { KpisController } from './kpis.controller';

describe('KpisController', () => {
  let controller: KpisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KpisController],
    }).compile();

    controller = module.get<KpisController>(KpisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
