import { Injectable, Logger } from '@nestjs/common';
import { SecretProvider } from './secret-provider.interface';

@Injectable()
export class EnvSecretProvider implements SecretProvider {
  private readonly logger = new Logger(EnvSecretProvider.name);

  async getSecret(secretRef: string): Promise<string | null> {
    // Expected format: 'env:VAR_NAME' or just 'VAR_NAME'
    const varName = secretRef.startsWith('env:') ? secretRef.substring(4) : secretRef;
    
    const secret = process.env[varName];
    if (!secret) {
      this.logger.warn(`Secret ${varName} not found in environment`);
      return null;
    }
    
    return secret;
  }
}
