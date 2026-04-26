import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

/**
 * Ghép prefix locale vào pathname theo chiến lược localePrefix='as-needed'.
 * - Locale mặc định (vi): KHÔNG có prefix → /projects
 * - Locale khác (en): CÓ prefix → /en/projects
 */
export function localizedPath(pathname: string, locale: string): string {
  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (locale === routing.defaultLocale) return clean || '/';
  return `/${locale}${clean === '/' ? '' : clean}`;
}

/**
 * Build alternates.languages cho hreflang: giúp Google biết phiên bản ngôn ngữ tương ứng.
 */
export function buildLanguageAlternates(pathname: string) {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = localizedPath(pathname, locale);
  }
  // x-default trỏ về ngôn ngữ mặc định
  languages['x-default'] = localizedPath(pathname, routing.defaultLocale);
  return languages;
}

/**
 * hreflang khi slug khác nhau theo locale (vd. /services/thiet-ke-kien-truc vs /en/services/architectural-design).
 * `viPathname` / `enPathname`: path không gồm prefix locale, bắt đầu bằng /.
 */
export function buildServiceLanguageAlternates(
  viPathname: string,
  enPathname: string,
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    const path = locale === routing.defaultLocale ? viPathname : enPathname;
    languages[locale] = localizedPath(path, locale);
  }
  languages['x-default'] = localizedPath(viPathname, routing.defaultLocale);
  return languages;
}

/**
 * Sinh Metadata cho một trang tĩnh trong namespace PageTitles.
 */
export async function pageMetadata({
  locale,
  titleKey,
  descriptionKey,
  href,
  noIndex,
}: {
  locale: string;
  titleKey: string;
  descriptionKey?: string;
  href: string;
  noIndex?: boolean;
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'PageTitles' });
  const title = t(titleKey);
  const description = descriptionKey ? t(descriptionKey) : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: localizedPath(href, locale),
      languages: buildLanguageAlternates(href),
    },
    openGraph: {
      title,
      description,
      locale,
      type: 'website',
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
