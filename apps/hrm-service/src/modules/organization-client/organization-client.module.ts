import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { OrganizationClientService } from './organization-client.service';

/** Symbol để inject gRPC client của OrganizationService (user-service) */
export const ORGANIZATION_GRPC_CLIENT = 'ORGANIZATION_GRPC_CLIENT';

const protoRoot =
  process.env.PROTO_PATH ?? join(process.cwd(), '..', 'protos');

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: ORGANIZATION_GRPC_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'organization',
            protoPath: join(protoRoot, 'users', 'organization.proto'),
            url:
              cfg.get<string>('USER_SERVICE_ADDR') ?? 'user-service:50051',
            loader: {
              keepCase: false,
              longs: String,
              enums: String,
              defaults: true,
              includeDirs: [protoRoot],
            },
          },
        }),
      },
    ]),
  ],
  providers: [OrganizationClientService],
  exports: [OrganizationClientService],
})
export class OrganizationClientModule { }
