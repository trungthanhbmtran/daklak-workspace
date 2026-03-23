import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('APIGateway');

  app.setGlobalPrefix('api/v1');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('API Gateway – Tiếp nhận request, validate, chuyển microservice, response')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .addTag('Auth', 'Đăng nhập, đăng xuất, thông tin user')
    .addTag('Users', 'Người dùng (user-service: CreateUser, FindOne, AssignPosition)')
    .addTag('PBAC', 'Chính sách phân quyền – Vai trò và ma trận quyền (user-service)')
    .addTag('Danh mục hệ thống', 'Danh mục dùng chung: UNIT_TYPE, GENDER... (user-service)')
    .addTag('Menu', 'Menu sidebar theo user (user-service)')
    .addTag('Đơn vị tổ chức', 'Đơn vị, cây tổ chức, định biên (user-service)')
    .addTag('HRM', 'Đơn vị, nhân viên, định biên, chức danh')
    .addTag('Documents', 'Nhóm văn bản')
    .addTag('Posts', 'Bài viết, danh mục, banner')
    .addTag('Storage', 'Lưu trữ file')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  app.use(cookieParser());
  // CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 3. Cấu hình Validation (Tự động kiểm tra dữ liệu đầu vào)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false, // Cho phép field thừa khi proxy
    transform: true,
  }));

  // 4. Áp dụng Interceptor toàn cục
  // Mọi API trả về sẽ có dạng chuẩn: { success: true, data: ..., timestamp: ... }
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Gateway đang chạy tại: http://localhost:${port}/api/v1`);
  logger.log(`📖 Swagger: http://localhost:${port}/api/docs`);
  // logger.log(`📡 Kết nối tới User Service: ${process.env.USER_SERVICE_ADDR || 'user-service:50051'}`);
  // logger.log(`📡 Kết nối tới HRM Service (project_stc/hrm-service): ${process.env.HRM_SERVICE_ADDR || '127.0.0.1:50052'}`);
}

bootstrap();