import { Test, TestingModule } from '@nestjs/testing';
import { AiModule } from './ai.module';
import { AiFeatureService } from './ai-feature.service';

describe('AiModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    // We mock process.env variables that might be needed
    process.env.HRM_GRPC_URL = '0.0.0.0:50053';
    process.env.USERS_GRPC_URL = '0.0.0.0:50051';
    process.env.RABBITMQ_URL = 'amqp://admin:admin123@localhost:5672';
    
    module = await Test.createTestingModule({
      imports: [AiModule],
    }).compile();
  });

  it('should compile the module and resolve AiFeatureService', () => {
    expect(module).toBeDefined();
    
    // Check if AiFeatureService is successfully injected
    const aiFeatureService = module.get<AiFeatureService>(AiFeatureService);
    expect(aiFeatureService).toBeDefined();
  });
});
