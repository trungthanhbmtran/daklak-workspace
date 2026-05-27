import { Test, TestingModule } from '@nestjs/testing';
import { MasterPlansController } from './master-plans.controller';

describe('MasterPlansController', () => {
  let controller: MasterPlansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MasterPlansController],
    }).compile();

    controller = module.get<MasterPlansController>(MasterPlansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
