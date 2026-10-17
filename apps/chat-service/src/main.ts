import { TransformInterceptor } from "@core/interceptors/transform.interceptor";
import { AllExceptionsFilter } from "@core/filters/all-exceptions.filter";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { join } from "path";
import { Logger, ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const logger = new Logger("ChatService");
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // 1. Configure Global Middlewares/Pipes for REST
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.enableCors();

  // 2. Connect as a gRPC microservice (Hybrid mode)
  const protoRoot =
    process.env.PROTO_PATH ??
    join(process.cwd(), "..", "..", "shared", "protos");
  const chatProtoPath = join(protoRoot, "chat", "chat.proto");

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: "chat",
      protoPath: chatProtoPath,
      url: process.env.GRPC_URL ?? "0.0.0.0:50061", // Port 50061 for ChatService
      loader: {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: true,
        includeDirs: [protoRoot],
      },
    },
  });

  // 3. Connect to RabbitMQ (Event Subscriber)
  const rabbitUrl = process.env.RABBITMQ_URL;
  if (!rabbitUrl) {
    // Fail-fast: không chạy với credentials mặc định (đã xóa fallback amqp://admin:...@localhost)
    throw new Error(
      "RABBITMQ_URL chưa được cấu hình " +
        "— chat-service yêu cầu RabbitMQ để subscribe chat_queue. Vui lòng cấu hình RABBITMQ_URL trong .env.",
    );
  }
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: "chat_queue",
      queueOptions: {
        durable: true,
      },
    },
  });

  // 4. Start both REST and Microservices
  app.enableShutdownHooks();
  await app.startAllMicroservices();

  const port = process.env.PORT || 3004; // Different port from workflow
  await app.listen(port);

  logger.log(`🚀 REST API running at: http://localhost:${port}/api/v1`);
  logger.log(
    `📡 gRPC Service listening on: ${process.env.GRPC_URL ?? "0.0.0.0:50061"}`,
  );
}
bootstrap().catch((err) => {
  console.error("Error starting ChatService", err);
  process.exit(1);
});
