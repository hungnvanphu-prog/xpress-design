import { setRequestLocale } from 'next-intl/server';
import { api } from '@/lib/api';
import { toUiProjects, type StrapiProject } from '@/lib/cms-transform';
import HomeClient from './home-client';

type Params = Promise<{ locale: string }>;

export const dynamic = 'force-dynamic';

const FEATURED_LIMIT = 4;

export default async function HomePage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const res = await api
    .cmsProjects(locale)
    .catch(() => ({ data: [] as StrapiProject[] }));

  const all = toUiProjects((res?.data ?? []) as StrapiProject[]);

  // Ưu tiên dự án `featured`, sau đó tới các dự án còn lại; cắt 4 dự án đầu cho trang chủ
  const featuredProjects = [
    ...all.filter((p) => p.featured),
    ...all.filter((p) => !p.featured),
  ].slice(0, FEATURED_LIMIT);

  return <HomeClient featuredProjects={featuredProjects} />;
}
