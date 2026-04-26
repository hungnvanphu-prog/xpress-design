import { pageMetadata } from '@/lib/metadata';
import ServicesLandingClient from './services-landing-client';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  return pageMetadata({
    locale,
    titleKey: 'services',
    descriptionKey: 'servicesDescription',
    href: '/services',
  });
}

export default function ServicesPage() {
  return <ServicesLandingClient />;
}
