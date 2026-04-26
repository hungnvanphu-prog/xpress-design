import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { api } from '@/lib/api';
import { getCmsProjectBySlugResponse } from '@/lib/cms-rsc-cache';
import { toUiProject, toUiProjects, type StrapiProject } from '@/lib/cms-transform';
import { routing } from '@/i18n/routing';
import { localizedPath } from '@/lib/metadata';
import ProjectDetailClient from './project-detail-client';
import { LocalizedRouteSetter } from '@/lib/localized-route';

type Params = Promise<{ locale: string; slug: string }>;

// Dữ liệu CMS: render theo request (tránh cache tĩnh rỗng khi build không có API)
export const dynamic = 'force-dynamic';

async function fetchProject(slug: string, locale: string) {
  const res = await getCmsProjectBySlugResponse(slug, locale);
  const entity = res?.data?.[0] as StrapiProject | undefined;
  return entity ? toUiProject(entity) : null;
}

async function fetchAllProjects(locale: string) {
  const res = await api.cmsProjects(locale).catch(() => ({ data: [] as StrapiProject[] }));
  return toUiProjects((res?.data ?? []) as StrapiProject[]);
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await fetchProject(slug, locale);
  if (!project) return { title: 'Not found' };

  const path = `/projects/${slug}`;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    const lSlug = project.localizedSlugs?.[l] ?? slug;
    languages[l] = localizedPath(`/projects/${lSlug}`, l);
  }
  const defSlug =
    project.localizedSlugs?.[routing.defaultLocale] ?? slug;
  languages['x-default'] = localizedPath(`/projects/${defSlug}`, routing.defaultLocale);

  const description = (project.description || '').slice(0, 160);

  return {
    title: project.title,
    description,
    alternates: {
      canonical: localizedPath(path, locale),
      languages,
    },
    openGraph: {
      title: project.title,
      description,
      images: project.image ? [project.image] : [],
      type: 'article',
    },
  };
}

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [project, all] = await Promise.all([
    fetchProject(slug, locale),
    fetchAllProjects(locale),
  ]);
  if (!project) notFound();

  const currentIndex = all.findIndex((p) => p.slug === slug);
  const nextProject =
    all.length > 0 ? all[(currentIndex + 1 + all.length) % all.length] : null;
  // Tránh tự trỏ về chính mình khi chỉ có 1 dự án
  const safeNext = nextProject && nextProject.slug !== slug ? nextProject : null;

  return (
    <>
      <LocalizedRouteSetter
        basePath="/projects"
        slugs={project.localizedSlugs ?? {}}
      />
      <ProjectDetailClient project={project} nextProject={safeNext} />
    </>
  );
}
