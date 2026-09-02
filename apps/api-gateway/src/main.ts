import { TransformInterceptor } from '@core/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '@core/filters/all-exceptions.filter';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport, RmqOptions } from '@nestjs/microservices';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

const logger = new Logger('APIGateway');

/**
 * Đọc và validate các biến môi trường bắt buộc ngay khi bootstrap,
 * fail-fast thay vì âm thầm fallback sang giá trị mặc định không an toàn.
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
 * Cấu hình chung cho các microservice RabbitMQ, chỉ khác nhau ở queue/prefetch.
 * Tránh lặp lại object connectMicroservice 3 lần.
 */
const RMQ_QUEUES: Array<{ queue: string; prefetchCount: number }> = [
  { queue: 'ai_tasks_queue', prefetchCount: 10 },
  { queue: 'gateway_queue', prefetchCount: 50 },
  { queue: 'chat_events_queue', prefetchCount: 50 },
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
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.use(cookieParser());

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // Từ chối field lạ thay vì âm thầm bỏ qua
      transform: true,
    }),
  );

  // CORS: whitelist tường minh qua env, không dùng origin: true kèm credentials: true
  app.enableCors({
    origin: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : false,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription(
      'API Gateway – Tiếp nhận request, validate, chuyển microservice, response',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .addTag('Auth', 'Đăng nhập, đăng xuất, thông tin user')
    .addTag(
      'Users',
      'Người dùng (user-service: CreateUser, FindOne, AssignPosition)',
    )
    .addTag(
      'PBAC',
      'Chính sách phân quyền – Vai trò và ma trận quyền (user-service)',
    )
    .addTag(
      'Danh mục hệ thống',
      'Danh mục dùng chung: UNIT_TYPE, GENDER... (user-service)',
    )
    .addTag('Menu', 'Menu sidebar theo user (user-service)')
    .addTag('Đơn vị tổ chức', 'Đơn vị, cây tổ chức, định biên (user-service)')
    .addTag('HRM', 'Đơn vị, nhân viên, định biên, chức danh')
    .addTag('Documents', 'Nhóm văn bản')
    .addTag('Posts', 'Bài viết, danh mục, banner')
    .addTag('Storage', 'Lưu trữ file')
    .build();

  // Chỉ bật Swagger ngoài production để tránh lộ tài liệu API
  if (process.env.NODE_ENV !== 'production') {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
      useGlobalPrefix: true,
    });
  }

  // Kết nối các RabbitMQ microservices từ config chung, tránh lặp code
  RMQ_QUEUES.forEach(({ queue, prefetchCount }) => {
    app.connectMicroservice<MicroserviceOptions>(
      buildRmqOptions(queue, prefetchCount),
    );
  });

  // Đóng kết nối (RabbitMQ, HTTP server...) sạch sẽ khi nhận SIGTERM/SIGINT
  app.enableShutdownHooks();

  await app.startAllMicroservices();
  await app.listen(PORT, '0.0.0.0');

  logger.log(`🚀 Gateway đang chạy tại: http://localhost:${PORT}/api/v1`);
  if (process.env.NODE_ENV !== 'production') {
    logger.log(`📖 Swagger: http://localhost:${PORT}/api/v1/docs`);
  }
}

bootstrap().catch((error) => {
  logger.error('❌ Bootstrap thất bại:', error?.stack ?? error);
  process.exit(1);
});