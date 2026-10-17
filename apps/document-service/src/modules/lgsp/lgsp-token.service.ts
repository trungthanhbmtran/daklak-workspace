import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { LgspConfigService } from './lgsp.config';

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

@Injectable()
export class LgspTokenService {
  private readonly logger = new Logger(LgspTokenService.name);
  private tokenCache = new Map<string, CachedToken>();

  constructor(private readonly configService: LgspConfigService) {}

  /**
   * Lấy Bearer Access Token cho scope tương ứng (Mục 4.1.8)
   * Tự động cache theo thời gian hết hạn (expires_in - 60s)
   */
  async getAccessToken(scope: string): Promise<string> {
    const cached = this.tokenCache.get(scope);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      return cached.accessToken;
    }

    if (!this.configService.isConfigured()) {
      throw new BadRequestException(
        'LGSP chưa được cấu hình đầy đủ client_id và client_secret bí mật. Vui lòng cung cấp khóa bí mật trước khi thực hiện gọi liên thông.',
      );
    }

    const ssoUrl = this.configService.ssoUrl;
    const bodyParams = new URLSearchParams();
    bodyParams.append('grant_type', 'client_credentials');
    bodyParams.append('client_id', this.configService.clientId);
    bodyParams.append('client_secret', this.configService.clientSecret);
    bodyParams.append('scope', scope);

    if (this.configService.username) {
      bodyParams.append('username', this.configService.username);
    }
    if (this.configService.password) {
      bodyParams.append('password', this.configService.password);
    }

    const authHeader = `Basic ${Buffer.from(
      `${this.configService.clientId}:${this.configService.clientSecret}`,
    ).toString('base64')}`;

    try {
      this.logger.log(`Yêu cầu cấp access_token từ SSO: scope=${scope}`);
      let response: any;
      try {
        response = await axios.post(ssoUrl, bodyParams.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: authHeader,
          },
          timeout: 10000,
        });
      } catch (err: any) {
        const errorText = typeof err.response?.data === 'string'
          ? err.response.data
          : JSON.stringify(err.response?.data || err.message);
        const status = err.response?.status || 500;
        this.logger.error(`Lỗi xác thực OAuth2 LGSP (${status}): ${errorText}`);
        throw new InternalServerErrorException(
          `Không thể xác thực với hệ thống SSO LGSP (${status}): ${errorText}`,
        );
      }

      const data = response.data;
      if (!data?.access_token) {
        throw new InternalServerErrorException(
          `Phản hồi từ SSO LGSP không chứa access_token: ${JSON.stringify(data)}`,
        );
      }

      const expiresInSec = typeof data.expires_in === 'number' ? data.expires_in : 3600;
      const ttlMs = Math.max(30, expiresInSec - 60) * 1000;

      this.tokenCache.set(scope, {
        accessToken: data.access_token,
        expiresAt: now + ttlMs,
      });

      this.logger.log(`Cấp token thành công cho scope=${scope}, hiệu lực ${expiresInSec}s`);
      return data.access_token;
    } catch (err: any) {
      if (err instanceof BadRequestException || err instanceof InternalServerErrorException) {
        throw err;
      }
      const isTimeout = err.name === 'AbortError' || err.name === 'TimeoutError' || err.message?.includes('aborted');
      if (isTimeout) {
        this.logger.error(`Kết nối SSO LGSP quá thời gian (10s): ${ssoUrl}`);
        throw new InternalServerErrorException(
          `Thời gian kết nối tới máy chủ SSO LGSP (${ssoUrl}) quá hạn (10s). Máy chủ thuộc mạng nội bộ/VPN Đắk Lắk (10.30.1.7). Vui lòng kiểm tra VPN hoặc cấu hình liên thông.`,
        );
      }
      this.logger.error(`Lỗi kết nối tới SSO LGSP: ${err.message}`);
      throw new InternalServerErrorException(
        `Không thể kết nối tới máy chủ SSO LGSP (${ssoUrl}): ${err.message}. Kiểm tra kết nối mạng/VPN tỉnh Đắk Lắk.`,
      );
    }
  }

  /**
   * Xóa cache token (khi cần làm mới hoặc đổi thông tin xác thực)
   */
  clearTokenCache(): void {
    this.tokenCache.clear();
    this.logger.log('Đã làm mới token cache LGSP');
  }
}
