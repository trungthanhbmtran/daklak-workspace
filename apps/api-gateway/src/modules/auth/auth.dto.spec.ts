import { ValidationPipe } from '@nestjs/common';
import { LoginDto, RefreshTokenDto } from './auth.dto';

describe('Auth input DTOs', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
  it.each([
    { username: 'a'.repeat(255), password: 'password' },
    { username: 'valid', password: 'a'.repeat(73) },
    { username: 12, password: 'password' },
    { username: 'valid', password: 12 },
    { username: 'valid', password: 'password', role: 'ADMIN' },
  ])('rejects invalid credential shapes and extra fields', async (body) => {
    await expect(
      pipe.transform(body, { type: 'body', metatype: LoginDto }),
    ).rejects.toMatchObject({ status: 400 });
  });
  it('allows existing short passwords and preserves whitespace for verification', async () => {
    const result = await pipe.transform(
      { email: 'test@example.test', password: ' pass ' },
      { type: 'body', metatype: LoginDto },
    );
    expect(result).toBeInstanceOf(LoginDto);
    expect(result.password).toBe(' pass ');
  });
  it.each([{ refreshToken: 123 }, { refreshToken: 'a'.repeat(129) }])(
    'rejects malformed refresh values',
    async (body) => {
      await expect(
        pipe.transform(body, { type: 'body', metatype: RefreshTokenDto }),
      ).rejects.toMatchObject({ status: 400 });
    },
  );
  it('allows the cookie-based refresh flow with an empty body', async () => {
    await expect(
      pipe.transform({}, { type: 'body', metatype: RefreshTokenDto }),
    ).resolves.toBeInstanceOf(RefreshTokenDto);
  });
});
