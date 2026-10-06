import { Module, Global } from '@nestjs/common';
import { RateLimiterModule } from '../../core/rate-limiter/rate-limiter.module';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { RegistryService } from './registry.service';
import { TokenValidatorService } from './token-validator.service';
import { EnvSecretProvider } from './secrets/env-secret-provider.service';
import { ImportParserService } from './import.service';

@Global()
@Module({
  imports: [RateLimiterModule],
  controllers: [IntegrationController],
  providers: [IntegrationService, RegistryService, TokenValidatorService, EnvSecretProvider, ImportParserService],
  exports: [IntegrationService, RegistryService, TokenValidatorService, EnvSecretProvider],
})
export class IntegrationModule {}
