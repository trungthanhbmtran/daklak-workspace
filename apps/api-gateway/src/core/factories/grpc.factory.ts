import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

// PROTO_PATH env cho K8s/Docker; fallback: relative to libs/proto
const PROTO_ROOT = process.env.PROTO_PATH || join(__dirname, '../../../../libs/proto');

export function registerGrpcService(serviceConfig: any) {
  return ClientsModule.register([
    {
      name: serviceConfig.SYMBOL,
      transport: Transport.GRPC,
      options: {
        package: serviceConfig.PACKAGE,
        protoPath: join(PROTO_ROOT, serviceConfig.PROTO),
        url: serviceConfig.URL,
        loader: {
          keepCase: false,
          longs: String,
          enums: String,
          defaults: true,
          includeDirs: [PROTO_ROOT],
        },
      },
    },
  ]);
}