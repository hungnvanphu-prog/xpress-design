import { notFound } from 'next/navigation';

/**
 * Bắt mọi đường dẫn dưới [locale] không trùng route cụ thể nào (vd. /about2, /en/xyz).
 * Gọi notFound() để dùng app/[locale]/not-found.tsx (NotFoundView) thay vì 404 tối thiểu ở gốc.
 */
export default function CatchAllUnmatched() {
  notFound();
}
