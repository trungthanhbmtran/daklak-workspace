import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { MICROSERVICES } from '../../core/constants/services';
import { ChatGateway } from './chat.gateway';

describe('ChatController', () => {
  let controller: ChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: {},
        },
        {
          provide: 'CHAT_PACKAGE',
          useValue: {},
        },
        {
          provide: 'EMPLOYEE_PACKAGE',
          useValue: {},
        },
        {
          provide: ChatGateway,
          useValue: {},
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
