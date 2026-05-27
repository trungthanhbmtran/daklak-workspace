import { Test, TestingModule } from '@nestjs/testing';
import { TaskTemplatesService } from './task-templates.service';

describe('TaskTemplatesService', () => {
  let service: TaskTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskTemplatesService],
    }).compile();

    service = module.get<TaskTemplatesService>(TaskTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
