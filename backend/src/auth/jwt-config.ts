import { ConfigService } from '@nestjs/config';

const DEV_INSECURE_FALLBACK = 'dev-only-insecure-jwt-secret-not-for-prod';

/**
 * Từ chối khởi động production nếu thiếu secret — tránh mặc định dễ đoán.
 */
export function resolveJwtSecret(config: ConfigService): string {
  const s = config.get<string>('JWT_SECRET')?.trim();
  if (s) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return DEV_INSECURE_FALLBACK;
}
