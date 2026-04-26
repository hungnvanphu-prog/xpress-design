import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';

const heading = "font-['Playfair_Display',serif]";
const body = "font-['Montserrat',sans-serif]";

type Props = {
  title: string;
  button: string;
  href?: string;
};

export function ServiceCTA({ title, button, href = '/contact' }: Props) {
  return (
    <section className="bg-[#F8F9FA] py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className={`${heading} text-2xl font-medium text-[#1A1A1A] md:text-4xl leading-tight`}>
          {title}
        </h2>
        <Link
          href={href}
          className={`${body} group mt-10 inline-flex items-center justify-center bg-[#D4AF37] px-10 py-4 text-sm font-bold uppercase tracking-[0.2em] text-[#1A1A1A] transition-transform hover:scale-[1.02] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#1A1A1A]`}
        >
          {button}
          <ArrowRight
            className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </div>
    </section>
  );
}
