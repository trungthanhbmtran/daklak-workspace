import { PrismaClient } from '../../src/generated/prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

export interface AiProviderConfig {
  id: string;
  provider: 'OPENAI' | 'GEMINI' | 'CLAUDE';
  model: string;
  apiKey: string;
  priority: number;
  enabled: boolean;
}

export const DEFAULT_AI_PROVIDERS: AiProviderConfig[] = [
  {
    id: 'ai_gemini_primary',
    provider: 'GEMINI',
    model: 'gemini-1.5-pro',
    apiKey: process.env.GEMINI_API_KEY || '',
    priority: 1,
    enabled: true,
  },
  {
    id: 'ai_openai_fallback',
    provider: 'OPENAI',
    model: 'gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY || '',
    priority: 2,
    enabled: true,
  },
];

export async function seedAiProviders(prisma: PrismaClient) {
  console.log('🤖 Seeding AI Providers (Gemini & OpenAI API Keys)...');

  const providersJson = JSON.stringify(DEFAULT_AI_PROVIDERS);

  // 1. Seed vào SystemConfig (sys_configs) cho toàn hệ thống
  await prisma.systemConfig.upsert({
    where: { key: 'AI_PROVIDERS' },
    update: {
      value: providersJson,
      description:
        'Cấu hình AI Đa nền tảng & Cơ chế Failover (Google Gemini & OpenAI)',
    },
    create: {
      key: 'AI_PROVIDERS',
      value: providersJson,
      description:
        'Cấu hình AI Đa nền tảng & Cơ chế Failover (Google Gemini & OpenAI)',
      organizationId: 'DEFAULT',
    },
  });

  // 2. Seed vào UserConfig (user_configs) cho các tài khoản quản trị viên
  const keyUsers = await prisma.user.findMany({
    where: {
      username: { in: ['superadmin', 'admin'] },
    },
  });

  for (const user of keyUsers) {
    await prisma.userConfig.upsert({
      where: {
        userId_key: {
          userId: user.id,
          key: 'AI_PROVIDERS',
        },
      },
      update: {
        value: providersJson,
      },
      create: {
        userId: user.id,
        key: 'AI_PROVIDERS',
        value: providersJson,
        organizationId: 'DEFAULT',
      },
    });
  }

  console.log(
    `✅ Đã nạp thành công cấu hình AI Router cho SystemConfig và ${keyUsers.length} tài khoản quản trị.`,
  );
}
