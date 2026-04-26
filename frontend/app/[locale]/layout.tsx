import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FloatingActions } from '@/components/FloatingActions';
import { ScrollReset, TrackingScripts } from './scroll-reset';
import { LocalizedRouteProvider } from '@/lib/localized-route';
import '../globals.css';

// Pre-generate route cho mọi locale để SSG
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: {
      default: t('siteName'),
      template: `%s | ${t('siteName')}`,
    },
    description: t('siteDescription'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Quan trọng cho static rendering — inform next-intl locale
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Common' });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-[#F8F9FA] selection:bg-[#D4AF37] selection:text-white">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-[#1A1A1A] focus:px-4 focus:py-2 focus:text-[13px] focus:text-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-white"
        >
          {t('skipToMain')}
        </a>
        <NextIntlClientProvider>
          <LocalizedRouteProvider>
            <TrackingScripts />
            <ScrollReset />
            <Header />
            <main id="main" data-e2e="app-main">
              {children}
            </main>
            <Footer />
            <FloatingActions />
          </LocalizedRouteProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
