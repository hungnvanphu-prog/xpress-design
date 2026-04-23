import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match mọi path TRỪ api, _next, _vercel, static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
