import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { AUTH_DEFAULTS } from '../../../../../shared/core/auth-session';

export class LoginDto {
  @IsOptional()
  @IsString()
  @MaxLength(AUTH_DEFAULTS.loginIdentifierMaxLength)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(AUTH_DEFAULTS.loginIdentifierMaxLength)
  email?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(AUTH_DEFAULTS.passwordMaxBytes)
  password!: string;

  @IsOptional()
  @IsString()
  lang?: string;
}

export class RefreshTokenDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  refreshToken?: string;

  @IsOptional()
  @IsString()
  lang?: string;
}
