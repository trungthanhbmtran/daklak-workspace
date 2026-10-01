import { Test, TestingModule } from '@nestjs/testing';
import { QdrantService } from './qdrant.service';
import { QdrantClient } from '@qdrant/js-client-rest';

// Mock QdrantClient
jest.mock('@qdrant/js-client-rest', () => {
  return {
    QdrantClient: jest.fn().mockImplementation(() => {
      return {
        collectionExists: jest.fn().mockResolvedValue({ exists: true }),
        createCollection: jest.fn(),
        upsert: jest.fn(),
        search: jest.fn(),
      };
    }),
  };
});

describe('QdrantService', () => {
  let service: QdrantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QdrantService],
    }).compile();

    service = module.get<QdrantService>(QdrantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize QdrantClient with checkCompatibility: false', () => {
    service.onModuleInit();
    expect(QdrantClient).toHaveBeenCalledWith({
      url: expect.any(String),
      checkCompatibility: false,
    });
  });
});
