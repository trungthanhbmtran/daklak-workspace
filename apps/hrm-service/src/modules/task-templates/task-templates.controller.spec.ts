import { Test, TestingModule } from '@nestjs/testing';
import { TaskTemplatesController } from './task-templates.controller';

describe('TaskTemplatesController', () => {
  let controller: TaskTemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskTemplatesController],
    }).compile();

    controller = module.get<TaskTemplatesController>(TaskTemplatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
