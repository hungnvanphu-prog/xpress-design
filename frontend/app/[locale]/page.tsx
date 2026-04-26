import { setRequestLocale } from 'next-intl/server';
import { api } from '@/lib/api';
import { pageMetadata } from '@/lib/metadata';
import { toUiProjects, type StrapiProject } from '@/lib/cms-transform';
import HomeClient from './home-client';

type Params = Promise<{ locale: string }>;

/**
 * Cần render theo từng request: dữ liệu Strapi lấy khi gọi API;
 * dùng `revalidate` ở segment dễ khiến bản build tĩnh cache rỗng nếu backend không có lúc `next build`.
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  return pageMetadata({
    locale,
    titleKey: 'home',
    descriptionKey: 'homeDescription',
    href: '/',
  });
}

const FEATURED_LIMIT = 4;
/** Đủ bản ghi để ưu tiên `featured` rồi cắt 4, không tải toàn catalog nếu có hàng nghìn bản. */
const HOME_PROJECTS_PAGE_SIZE = 48;

export default async function HomePage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const res = await api
    .cmsProjects(locale, { page: 1, pageSize: HOME_PROJECTS_PAGE_SIZE })
    .catch(() => ({ data: [] as StrapiProject[] }));

  const all = toUiProjects((res?.data ?? []) as StrapiProject[]);

  // Ưu tiên dự án `featured`, sau đó tới các dự án còn lại; cắt 4 dự án đầu cho trang chủ
  const featuredProjects = [
    ...all.filter((p) => p.featured),
    ...all.filter((p) => !p.featured),
  ].slice(0, FEATURED_LIMIT);

  return <HomeClient featuredProjects={featuredProjects} />;
}
