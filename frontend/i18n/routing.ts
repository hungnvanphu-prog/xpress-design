import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Danh sách ngôn ngữ được hỗ trợ
  locales: ['vi', 'en'] as const,

  // Ngôn ngữ mặc định — không prefix trên URL
  defaultLocale: 'vi',

  // 'as-needed' = URL tiếng Việt không có prefix (/projects),
  // URL tiếng Anh có prefix (/en/projects). Tốt cho SEO locale mặc định.
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
