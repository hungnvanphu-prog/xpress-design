import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import NotFoundView from '@/components/not-found-view';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'NotFound' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: true },
  };
}

/**
 * Truy cập thủ công: `/404` (vi) hoặc `/en/404` (en) — cùng giao diện với `not-found`.
 */
export default async function Custom404Page({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <NotFoundView />;
}
