import { Global, Module, Controller, Get } from '@nestjs/common';
import { TokenIssuerService } from './token-issuer.service';

@Controller('admin/auth')
class JwksController {
  constructor(private readonly issuer: TokenIssuerService) {}
  @Get('jwks')
  jwks() { return this.issuer.getJwks(); }
}

@Global()
@Module({ controllers: [JwksController], providers: [TokenIssuerService], exports: [TokenIssuerService] })
export class AuthCryptoModule {}

