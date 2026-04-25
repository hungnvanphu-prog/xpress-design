import { setRequestLocale } from 'next-intl/server';
import { api } from '@/lib/api';
import { toUiProjects, type StrapiProject } from '@/lib/cms-transform';
import ProjectsClient from './projects-client';

type Params = Promise<{ locale: string }>;

export const dynamic = 'force-dynamic';

export default async function ProjectsPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const res = await api
    .cmsProjects(locale)
    .catch(() => ({ data: [] as StrapiProject[] }));
  const projects = toUiProjects((res?.data ?? []) as StrapiProject[]);

  return <ProjectsClient projects={projects} />;
}
