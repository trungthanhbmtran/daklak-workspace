import { Module } from '@nestjs/common';
import { ApiManagementController } from './api-management.controller';
import { ImportParserService } from '../integration/import.service';
import { GatewayRegistryService } from './registry.service';
import { GatewayRegistryController } from './registry.controller';
import { ExecutorController } from './executor.controller';
import { ExecutorService } from './executor.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICES } from '../../core/constants/services';
import { join } from 'path';

const protoRoot =
  process.env.PROTO_PATH ?? join(process.cwd(), '..', '..', 'shared', 'protos');

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICES.INTEGRATION.SYMBOL,
        transport: Transport.GRPC,
        options: {
          package: 'api_management.v2',
          protoPath: join(protoRoot, 'integration', 'api-management.proto'),
          url: process.env.USER_SERVICE_GRPC_URL ?? '0.0.0.0:50051',
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
  controllers: [
    ApiManagementController,
    GatewayRegistryController,
    ExecutorController,
  ],
  providers: [ImportParserService, GatewayRegistryService, ExecutorService],
})
export class ApiManagementGatewayModule {}
