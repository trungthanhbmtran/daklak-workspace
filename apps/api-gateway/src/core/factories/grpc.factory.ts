import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

// PROTO_PATH env cho K8s/Docker; fallback: relative to libs/proto
const PROTO_ROOT =
  process.env.PROTO_PATH || join(__dirname, '../../../../../../shared/protos');

export function registerGrpcService(serviceConfig: any) {
  return ClientsModule.register([
    {
      name: serviceConfig.SYMBOL,
      transport: Transport.GRPC,
      options: {
        package: serviceConfig.PACKAGE,
        protoPath: join(PROTO_ROOT, serviceConfig.PROTO),
        url: serviceConfig.URL,
        channelOptions: {
          'grpc.max_receive_message_length': 64 * 1024 * 1024,
          'grpc.max_send_message_length': 64 * 1024 * 1024,
          'grpc.keepalive_time_ms': 30000,
          'grpc.keepalive_timeout_ms': 10000,
          'grpc.keepalive_permit_without_calls': 1,
          'grpc.http2.min_time_between_pings_ms': 10000,
          'grpc.http2.max_pings_without_data': 0,
          ...(serviceConfig.channelOptions || {}),
        },
        loader: {
          keepCase: false,
          longs: String,
          enums: String,
          defaults: true,
          objects: true,
          arrays: true,
          includeDirs: [PROTO_ROOT],
        },
      },
    },
  ]);
}
