import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { localizedPath } from '@/lib/metadata';
import BlogPostDetailClient from './blog-post-client';

type Params = Promise<{ locale: string; id: string }>;

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const path = `/blog/${id}`;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = localizedPath(path, l);
  }
  languages['x-default'] = localizedPath(path, routing.defaultLocale);

  return {
    title: `Article #${id}`,
    description: 'In-depth perspectives on premium architecture & interior design.',
    alternates: {
      canonical: localizedPath(path, locale),
      languages,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <BlogPostDetailClient id={id} />;
}
