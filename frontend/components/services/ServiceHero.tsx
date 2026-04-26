import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';

const heading = "font-['Playfair_Display',serif]";
const body = "font-['Montserrat',sans-serif]";

type Breadcrumb = {
  home: string;
  services: string;
  current: string;
};

type Props = {
  image: string;
  imageAlt: string;
  name: string;
  tagline: string;
  breadcrumb: Breadcrumb;
};

export function ServiceHero({ image, imageAlt, name, tagline, breadcrumb }: Props) {
  return (
    <section className="relative min-h-[48vh] md:min-h-[56vh] w-full overflow-hidden bg-[#1A1A1A]">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="relative h-full min-h-[48vh] w-full md:min-h-[56vh]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            className="object-cover object-center opacity-50"
            sizes="100vw"
          />
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/80 via-[#1A1A1A]/50 to-[#1A1A1A]/95"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[48vh] max-w-6xl flex-col justify-end px-6 pb-12 pt-32 md:min-h-[56vh] md:pb-20 md:pt-40">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className={`flex flex-wrap items-center gap-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/50 ${body}`}>
            <li>
              <Link href="/" className="hover:text-[#D4AF37] transition-colors">
                {breadcrumb.home}
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="inline h-3 w-3 text-white/30" />
            </li>
            <li>
              <Link href="/services" className="hover:text-[#D4AF37] transition-colors">
                {breadcrumb.services}
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="inline h-3 w-3 text-white/30" />
            </li>
            <li className="text-white/80">{breadcrumb.current}</li>
          </ol>
        </nav>

        <h1
          className={`${heading} text-3xl font-medium leading-tight text-white md:text-5xl lg:text-[3.5rem] max-w-4xl`}
        >
          {name}
        </h1>
        <p
          className={`${body} mt-6 max-w-2xl text-sm font-light leading-relaxed text-white/80 md:text-base`}
        >
          {tagline}
        </p>
        <div
          className="mt-10 h-px w-20 bg-gradient-to-r from-[#D4AF37] to-transparent"
          aria-hidden
        />
      </div>
    </section>
  );
}
