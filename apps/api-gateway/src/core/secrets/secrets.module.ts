import { Global, Module } from '@nestjs/common';
import { EnvSecretProvider } from './env-secret-provider.service';

@Global()
@Module({
  providers: [EnvSecretProvider],
  exports: [EnvSecretProvider],
})
export class SecretsModule {}
