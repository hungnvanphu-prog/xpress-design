import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ALL_PROJECTS } from '@/data/projects';
import { routing } from '@/i18n/routing';
import { localizedPath } from '@/lib/metadata';
import ProjectDetailClient from './project-detail-client';

type Params = Promise<{ locale: string; id: string }>;

// SSG: pre-render tất cả projects cho từng locale
export async function generateStaticParams() {
  return ALL_PROJECTS.map((p) => ({ id: String(p.id) }));
}

// SEO: metadata động theo từng project + hreflang cho mọi locale
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const project = ALL_PROJECTS.find((p) => String(p.id) === id);
  if (!project) return { title: 'Not found' };

  const path = `/projects/${id}`;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = localizedPath(path, l);
  }
  languages['x-default'] = localizedPath(path, routing.defaultLocale);

  return {
    title: project.title,
    description: project.description.slice(0, 160),
    alternates: {
      canonical: localizedPath(path, locale),
      languages,
    },
    openGraph: {
      title: project.title,
      description: project.description.slice(0, 160),
      images: [project.image],
      type: 'article',
    },
  };
}

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const project = ALL_PROJECTS.find((p) => String(p.id) === id);
  if (!project) notFound();

  const currentIndex = ALL_PROJECTS.findIndex((p) => String(p.id) === id);
  const nextProject = ALL_PROJECTS[(currentIndex + 1) % ALL_PROJECTS.length] ?? null;

  return <ProjectDetailClient project={project} nextProject={nextProject} />;
}
