import { setRequestLocale } from 'next-intl/server';
import { api, readCmsPagination } from '@/lib/api';
import { toUiProjects, type StrapiProject } from '@/lib/cms-transform';
import ProjectsClient from './projects-client';

type Params = Promise<{ locale: string }>;
type SearchParams = Promise<{ page?: string; category?: string }>;

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 9;

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const category = (sp.category ?? 'all').trim() || 'all';

  const res = await api
    .cmsProjects(locale, { page, pageSize: PAGE_SIZE, category })
    .catch(() => ({ data: [] as StrapiProject[], meta: {} }));
  const projects = toUiProjects((res?.data ?? []) as StrapiProject[]);
  const pagination = readCmsPagination(res?.meta);

  return <ProjectsClient projects={projects} pagination={pagination} category={category} />;
}
