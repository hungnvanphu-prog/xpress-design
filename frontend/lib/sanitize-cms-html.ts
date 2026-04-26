import DOMPurify from 'isomorphic-dompurify';

/**
 * Làm sạch HTML từ Strapi (richtext) trước khi dùng dangerouslySetInnerHTML — giảm rủi ro stored XSS.
 */
export function sanitizeCmsHtml(html: string | null | undefined): string {
  if (html == null || html === '') return '';
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
