import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { OrganizationClientService } from './organization-client.service';

/** Symbol để inject gRPC client của OrganizationService (user-service) */
export const ORGANIZATION_GRPC_CLIENT = 'ORGANIZATION_GRPC_CLIENT';

const protoRoot =
  process.env.PROTO_PATH ?? join(process.cwd(), '..', 'protos');

@Module({
  imports: [
    // Dùng ClientsModule.register (không async) vì ConfigModule là @Global() — tránh circular dependency
    ClientsModule.register([
      {
        name: ORGANIZATION_GRPC_CLIENT,
        transport: Transport.GRPC,
        options: {
          package: 'organization',
          protoPath: join(protoRoot, 'users', 'organization.proto'),
          url: process.env.USER_SERVICE_ADDR ?? 'user-service:50051',
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            includeDirs: [protoRoot],
          },
        },
      },
    ]),
  ],
  providers: [OrganizationClientService],
  exports: [OrganizationClientService],
})
export class OrganizationClientModule { }
