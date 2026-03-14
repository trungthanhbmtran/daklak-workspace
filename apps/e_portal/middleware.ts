import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Matcher bỏ qua các file nội bộ của Next.js, static assets và đường dẫn /admin
  matcher: ['/((?!api|_next|_vercel|admin|public|media|.*\\..*).*)']
};