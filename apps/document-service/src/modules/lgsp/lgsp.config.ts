import { Injectable, Logger } from '@nestjs/common';
import { LGSP_SYSTEM_CODE, LGSP_ENDPOINTS } from './lgsp.constants';

export interface LgspConfigState {
  systemCode: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  ssoUrl: string;
  baseUrl: string;
}

@Injectable()
export class LgspConfigService {
  private readonly logger = new Logger(LgspConfigService.name);

  private config: LgspConfigState = {
    systemCode: process.env.LGSP_SYSTEM_CODE || LGSP_SYSTEM_CODE,
    clientId: process.env.LGSP_CLIENT_ID || 'PYRJBx37SCeuDZR6zX0G6HMDidQa',
    clientSecret: process.env.LGSP_CLIENT_SECRET || 'H2UckeTI6ArAVO7llaPpABxjnIEP0nGxH3x_OP0Gt0ga',
    username: process.env.LGSP_USERNAME || '',
    password: process.env.LGSP_PASSWORD || '',
    ssoUrl: process.env.LGSP_SSO_URL || LGSP_ENDPOINTS.TOKEN,
    baseUrl: process.env.LGSP_BASE_URL || LGSP_ENDPOINTS.BASE,
  };

  get systemCode(): string {
    return this.config.systemCode;
  }

  get clientId(): string {
    return this.config.clientId;
  }

  get clientSecret(): string {
    return this.config.clientSecret;
  }

  get username(): string {
    return this.config.username;
  }

  get password(): string {
    return this.config.password;
  }

  get ssoUrl(): string {
    return this.config.ssoUrl;
  }

  get baseUrl(): string {
    return this.config.baseUrl;
  }

  isConfigured(): boolean {
    return Boolean(
      this.config.systemCode &&
      this.config.clientId &&
      this.config.clientSecret,
    );
  }

  getPublicStatus() {
    return {
      systemCode: this.config.systemCode,
      ssoUrl: this.config.ssoUrl,
      baseUrl: this.config.baseUrl,
      hasClientId: Boolean(this.config.clientId),
      hasClientSecret: Boolean(this.config.clientSecret),
      hasUsername: Boolean(this.config.username),
      hasPassword: Boolean(this.config.password),
      isConfigured: this.isConfigured(),
    };
  }

  updateConfig(partial: Partial<LgspConfigState>) {
    if (partial.systemCode) this.config.systemCode = partial.systemCode.trim();
    if (partial.clientId !== undefined) this.config.clientId = partial.clientId.trim();
    if (partial.clientSecret !== undefined) this.config.clientSecret = partial.clientSecret.trim();
    if (partial.username !== undefined) this.config.username = partial.username.trim();
    if (partial.password !== undefined) this.config.password = partial.password.trim();
    if (partial.ssoUrl) this.config.ssoUrl = partial.ssoUrl.trim();
    if (partial.baseUrl) this.config.baseUrl = partial.baseUrl.trim();

    this.logger.log(
      `LGSP Configuration updated. Ready: ${this.isConfigured() ? 'YES' : 'PENDING_KEYS'}`,
    );
    return this.getPublicStatus();
  }
}
