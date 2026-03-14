import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { PrismaService } from '@/database/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: { create: jest.Mock; findUnique: jest.Mock; findFirst: jest.Mock };
    credential: { create: jest.Mock; update: jest.Mock };
    refreshToken: { create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
      credential: { create: jest.fn(), update: jest.fn() },
      refreshToken: { create: jest.fn() },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: 'NOTIFICATION_SERVICE', useValue: { emit: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn((k: string) => (k === 'JWT_EXPIRES_IN' ? '1h' : 'secret')) } },
        { provide: JwtService, useValue: { sign: jest.fn(() => 'mock-jwt') } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should return user with id and email', async () => {
      prisma.user.create.mockResolvedValue({
        id: 1,
        email: 'a@b.com',
        username: null,
        fullName: null,
        phoneNumber: null,
        avatarUrl: null,
        isActive: true,
      });
      const result = await service.createUser({ email: 'a@b.com' });
      expect(result).toMatchObject({ id: 1, email: 'a@b.com' });
      expect(result).toHaveProperty('username', '');
      expect(prisma.user.create).toHaveBeenCalledWith({ data: { email: 'a@b.com', username: null } });
    });
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'a@b.com',
        username: null,
        fullName: null,
        phoneNumber: null,
        avatarUrl: null,
        isActive: true,
      });
      const result = await service.findOne({ id: 1 });
      expect(result).toEqual({
        id: 1,
        email: 'a@b.com',
        username: '',
        fullName: '',
        phoneNumber: '',
        avatarUrl: '',
        isActive: true,
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw RpcException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findOne({ id: 999 })).rejects.toThrow(RpcException);
    });
  });
});
