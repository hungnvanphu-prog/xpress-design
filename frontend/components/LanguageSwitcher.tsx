"use client";

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { Globe } from 'lucide-react';
import { useTransition } from 'react';
import { useLocalizedRoute } from '@/lib/localized-route';

interface Props {
  variant?: 'desktop' | 'mobile';
}

export function LanguageSwitcher({ variant = 'desktop' }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('Common');
  const localizedRoute = useLocalizedRoute();

  const switchTo = (nextLocale: (typeof routing.locales)[number]) => {
    if (nextLocale === locale) return;
    startTransition(() => {
      // Nếu đang ở trang có slug bản dịch → đổi cả slug theo locale mới
      const translatedSlug = localizedRoute?.slugs?.[nextLocale];
      if (localizedRoute && translatedSlug) {
        router.replace(
          `${localizedRoute.basePath}/${translatedSlug}`,
          { locale: nextLocale },
        );
        return;
      }
      // Mặc định: giữ nguyên pathname, chỉ đổi prefix locale
      router.replace(pathname, { locale: nextLocale });
    });
  };

  const labels: Record<string, string> = { vi: 'VN', en: 'EN' };

  if (variant === 'mobile') {
    return (
      <div className="flex items-center gap-2 pt-4 border-t border-white/10" aria-label={t('language')}>
        <Globe size={16} className="text-white/70" />
        {routing.locales.map((l, i) => (
          <span key={l} className="flex items-center">
            {i > 0 && <span className="text-white/30 mx-1">/</span>}
            <button
              onClick={() => switchTo(l)}
              disabled={isPending}
              className={`text-sm font-bold tracking-wide ${
                l === locale ? 'text-white' : 'text-white/40 hover:text-white/70'
              } ${l === 'en' ? 'lowercase' : ''}`}
            >
              {l === 'en' ? 'en' : labels[l]}
            </button>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 border-l border-white/20 pl-6 ml-2" aria-label={t('language')}>
      <Globe size={16} className="text-white/70" />
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="text-white/30 text-[11px] mx-1">/</span>}
          <button
            onClick={() => switchTo(l)}
            disabled={isPending}
            className={`text-[11px] font-bold tracking-wide transition-colors ${
              l === locale ? 'text-white' : 'text-white/40 hover:text-white/70'
            } ${l === 'en' ? 'lowercase font-medium' : ''}`}
          >
            {l === 'en' ? 'en' : labels[l]}
          </button>
        </span>
      ))}
    </div>
  );
}
