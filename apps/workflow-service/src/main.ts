import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('WorkflowService');
  
  // 1. Create the main Nest application (REST)
  const app = await NestFactory.create(AppModule);
  
  // 2. Configure Global Middlewares/Pipes for REST
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  app.enableCors();

  // 3. Connect as a gRPC microservice (Hybrid mode)
  const protoRoot = process.env.PROTO_PATH ?? join(process.cwd(), '..', '..', 'shared', 'protos');
  const workflowProtoPath = join(protoRoot, 'workflow', 'workflow.proto');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'workflow',
      protoPath: workflowProtoPath,
      url: process.env.GRPC_URL ?? '0.0.0.0:50060', // Port 50060 as planned
      loader: {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: true,
      },
    },
  });

  // 4. Start both REST and gRPC
  await app.startAllMicroservices();
  
  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 REST API running at: http://localhost:${port}/api/v1`);
  logger.log(`📡 gRPC Service listening on: ${process.env.GRPC_URL ?? '0.0.0.0:50060'}`);
}
bootstrap();
