import { Module, Global } from '@nestjs/common';
import { ApiManagementController } from './api-management.controller';
import { ImportParserService } from './import.service';
import { GatewayRegistryService } from './registry.service';
import { GatewayRegistryController } from './registry.controller';
import { ExecutorController } from './executor.controller';
import { ExecutorService } from './executor.service';
import { PartnerController } from './partner.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICES } from '../../core/constants/services';
import { join } from 'path';

const protoRoot =
  process.env.PROTO_PATH ?? join(process.cwd(), '..', '..', 'shared', 'protos');

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICES.API_MANAGEMENT.SYMBOL,
        transport: Transport.GRPC,
        options: {
          package: 'api_management.v2',
          protoPath: join(protoRoot, 'integration', 'api-management.proto'),
          url: MICROSERVICES.API_MANAGEMENT.URL,
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
    PartnerController,
  ],
  providers: [ImportParserService, GatewayRegistryService, ExecutorService],
  exports: [GatewayRegistryService, ExecutorService],
})
export class ApiManagementGatewayModule {}
