import { TransformInterceptor } from '@core/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '@core/filters/all-exceptions.filter';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { trustedProxyAddresses } from './core/client-ip';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  MicroserviceOptions,
  Transport,
  RmqOptions,
} from '@nestjs/microservices';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

const logger = new Logger('APIGateway');

/**
 * Äá»c vÃ  validate cÃ¡c biáº¿n mÃ´i trÆ°á»ng báº¯t buá»™c ngay khi bootstrap,
 * fail-fast thay vÃ¬ Ã¢m tháº§m fallback sang giÃ¡ trá»‹ máº·c Ä‘á»‹nh khÃ´ng an toÃ n.
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const RABBITMQ_URL = getRequiredEnv('RABBITMQ_URL');
const PORT = Number(process.env.PORT) || 8080;
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

/**
 * Cáº¥u hÃ¬nh chung cho cÃ¡c microservice RabbitMQ, chá»‰ khÃ¡c nhau á»Ÿ queue/prefetch.
 * TrÃ¡nh láº·p láº¡i object connectMicroservice 3 láº§n.
 */
const RMQ_QUEUES: Array<{ queue: string; prefetchCount: number }> = [
  { queue: 'ai_tasks_queue', prefetchCount: 10 },
  { queue: 'gateway_queue', prefetchCount: 50 },
  { queue: 'chat_events_queue', prefetchCount: 50 },
  { queue: 'integration_events_queue', prefetchCount: 100 },
];

function buildRmqOptions(queue: string, prefetchCount: number): RmqOptions {
  return {
    transport: Transport.RMQ,
    options: {
      urls: [RABBITMQ_URL],
      queue,
      noAck: false,
      prefetchCount,
      queueOptions: {
        durable: true,
      },
    },
  };
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set(
    'trust proxy',
    trustedProxyAddresses(process.env.TRUSTED_PROXY_CIDRS),
  );

  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.use(cookieParser());

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // Tá»« chá»‘i field láº¡ thay vÃ¬ Ã¢m tháº§m bá» qua
      transform: true,
    }),
  );

  // CORS: whitelist tÆ°á»ng minh qua env, khÃ´ng dÃ¹ng origin: true kÃ¨m credentials: true
  app.enableCors({
    origin: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : false,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription(
      'API Gateway â€“ Tiáº¿p nháº­n request, validate, chuyá»ƒn microservice, response',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .addTag('Auth', 'ÄÄƒng nháº­p, Ä‘Äƒng xuáº¥t, thÃ´ng tin user')
    .addTag(
      'Users',
      'NgÆ°á»i dÃ¹ng (user-service: CreateUser, FindOne, AssignPosition)',
    )
    .addTag(
      'PBAC',
      'ChÃ­nh sÃ¡ch phÃ¢n quyá»n â€“ Vai trÃ² vÃ  ma tráº­n quyá»n (user-service)',
    )
    .addTag(
      'Danh má»¥c há»‡ thá»‘ng',
      'Danh má»¥c dÃ¹ng chung: UNIT_TYPE, GENDER... (user-service)',
    )
    .addTag('Menu', 'Menu sidebar theo user (user-service)')
    .addTag(
      'ÄÆ¡n vá»‹ tá»• chá»©c',
      'ÄÆ¡n vá»‹, cÃ¢y tá»• chá»©c, Ä‘á»‹nh biÃªn (user-service)',
    )
    .addTag('HRM', 'ÄÆ¡n vá»‹, nhÃ¢n viÃªn, Ä‘á»‹nh biÃªn, chá»©c danh')
    .addTag('Documents', 'NhÃ³m vÄƒn báº£n')
    .addTag('Posts', 'BÃ i viáº¿t, danh má»¥c, banner')
    .addTag('Storage', 'LÆ°u trá»¯ file')
    .build();

  // Chá»‰ báº­t Swagger ngoÃ i production Ä‘á»ƒ trÃ¡nh lá»™ tÃ i liá»‡u API
  if (process.env.NODE_ENV !== 'production') {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
      useGlobalPrefix: true,
    });
  }

  // Káº¿t ná»‘i cÃ¡c RabbitMQ microservices tá»« config chung, trÃ¡nh láº·p code
  RMQ_QUEUES.forEach(({ queue, prefetchCount }) => {
    app.connectMicroservice<MicroserviceOptions>(
      buildRmqOptions(queue, prefetchCount),
    );
  });

  // ÄÃ³ng káº¿t ná»‘i (RabbitMQ, HTTP server...) sáº¡ch sáº½ khi nháº­n SIGTERM/SIGINT
  app.enableShutdownHooks();

  await app.startAllMicroservices();
  await app.listen(PORT, '0.0.0.0');

  logger.log(
    `ðŸš€ Gateway Ä‘ang cháº¡y táº¡i: http://localhost:${PORT}/api/v1`,
  );
  if (process.env.NODE_ENV !== 'production') {
    logger.log(`ðŸ“– Swagger: http://localhost:${PORT}/api/v1/docs`);
  }
}

bootstrap().catch((error) => {
  logger.error('âŒ Bootstrap tháº¥t báº¡i:', error?.stack ?? error);
  process.exit(1);
});
