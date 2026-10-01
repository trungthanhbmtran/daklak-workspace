import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationService } from './integration.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as unknown as jest.Mock;

describe('IntegrationService', () => {
  let service: IntegrationService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    integrationConnection: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<IntegrationService>(IntegrationService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should use provided endpointPath and method if endpointId is not found', async () => {
      // Mock db response
      mockPrismaService.integrationConnection.findUnique.mockResolvedValue({
        id: 'conn-1',
        baseUrl: 'http://test.com',
        isActive: true,
        endpoints: JSON.stringify([
          { id: 'ep-1', path: '/api/v1/users', method: 'GET' }
        ]),
      });

      // Mock axios response
      mockedAxios.mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: { success: true }
      });

      const payload = {
        endpointId: 'ep-not-saved-yet',
        endpointPath: '/api/v1/test',
        method: 'POST',
        body: { foo: 'bar' }
      };

      const result = await service.execute('conn-1', payload);

      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        url: 'http://test.com/api/v1/test',
        method: 'POST',
        data: { foo: 'bar' },
      }));

      expect(result.status).toBe(200);
    });

    it('should fallback to first endpoint if no endpointId or endpointPath provided', async () => {
      // Mock db response
      mockPrismaService.integrationConnection.findUnique.mockResolvedValue({
        id: 'conn-1',
        baseUrl: 'http://test.com',
        isActive: true,
        endpoints: JSON.stringify([
          { id: 'ep-1', path: '/api/v1/first', method: 'GET' }
        ]),
      });

      mockedAxios.mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: { success: true }
      });

      const payload = {}; // empty payload, no endpoint specified

      const result = await service.execute('conn-1', payload);

      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        url: 'http://test.com/api/v1/first',
        method: 'GET',
      }));

      expect(result.status).toBe(200);
    });
  });
});
