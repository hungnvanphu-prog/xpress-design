import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import {
  getPathSlugsForService,
  getServiceContent,
  getServiceIdFromSlug,
  getUrlSlugForLocale,
  serviceHeroImage,
  serviceSlugs,
} from '@/data/services';
import { buildServiceLanguageAlternates, localizedPath } from '@/lib/metadata';
import { LocalizedRouteSetter } from '@/lib/localized-route';
import { ServiceCTA } from '@/components/services/ServiceCTA';
import { ServiceFeatures } from '@/components/services/ServiceFeatures';
import { ServiceHero } from '@/components/services/ServiceHero';
import { ServiceIntro } from '@/components/services/ServiceIntro';
import { ServiceProcess } from '@/components/services/ServiceProcess';

type Params = Promise<{ locale: string; slug: string }>;

export function generateStaticParams() {
  const rows = serviceSlugs.vi;
  return routing.locales.flatMap((locale) =>
    rows.map((row) => ({
      locale,
      slug: locale === routing.defaultLocale ? row.slug : row.enSlug,
    })),
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug: rawSlug } = await params;
  const serviceId = getServiceIdFromSlug(rawSlug);
  if (!serviceId) {
    return { title: 'Not found' };
  }
  const c = getServiceContent(serviceId, locale);
  const paths = getPathSlugsForService(serviceId);
  if (!paths) return { title: c.name };

  const desc = c.tagline.length > 160 ? `${c.tagline.slice(0, 157)}...` : c.tagline;
  const canonical = localizedPath(
    locale === routing.defaultLocale ? paths.viPath : paths.enPath,
    locale,
  );

  return {
    title: c.name,
    description: desc,
    alternates: {
      canonical,
      languages: buildServiceLanguageAlternates(paths.viPath, paths.enPath),
    },
    openGraph: {
      title: c.name,
      description: desc,
      locale,
      type: 'website',
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: Params }) {
  const { locale, slug: rawSlug } = await params;
  setRequestLocale(locale);

  const serviceId = getServiceIdFromSlug(rawSlug);
  if (!serviceId) notFound();

  const urlSlug = getUrlSlugForLocale(serviceId, locale);
  if (rawSlug !== urlSlug) {
    notFound();
  }

  const c = getServiceContent(serviceId, locale);
  const tNav = await getTranslations({ locale, namespace: 'Nav' });
  const paths = getPathSlugsForService(serviceId)!;

  const slugs: Record<string, string> = { vi: '', en: '' };
  for (const loc of routing.locales) {
    slugs[loc] = getUrlSlugForLocale(serviceId, loc);
  }

  return (
    <>
      <LocalizedRouteSetter basePath="/services" slugs={slugs} />
      <div className="min-h-screen bg-[#F8F9FA]">
        <ServiceHero
          image={serviceHeroImage[serviceId]}
          imageAlt={c.name}
          name={c.name}
          tagline={c.tagline}
          breadcrumb={{
            home: tNav('home'),
            services: tNav('services'),
            current: c.name,
          }}
        />
        <ServiceIntro description={c.description} />
        <ServiceFeatures title={c.whyChoose} features={c.features} />
        <ServiceProcess title={c.process} steps={c.processSteps} />
        <ServiceCTA title={c.cta} button={c.ctaButton} href="/contact" />
      </div>
    </>
  );
}
