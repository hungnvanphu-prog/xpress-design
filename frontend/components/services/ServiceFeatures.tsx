import { Check } from 'lucide-react';
import type { ServiceFeature } from '@/data/services';

const heading = "font-['Playfair_Display',serif]";
const body = "font-['Montserrat',sans-serif]";

type Props = {
  title: string;
  features: ServiceFeature[];
};

export function ServiceFeatures({ title, features }: Props) {
  return (
    <section className="bg-[#F8F9FA] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className={`${heading} text-center text-2xl font-medium text-[#1A1A1A] md:text-4xl max-w-3xl mx-auto leading-snug mb-4 md:mb-6`}
        >
          {title}
        </h2>
        <div
          className="mx-auto mb-14 h-1 w-16 bg-[#D4AF37]"
          aria-hidden
        />

        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {features.map((f) => (
            <li
              key={f.title}
              className="group border border-[#1A1A1A]/5 bg-white p-8 transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/30 text-[#D4AF37]">
                <Check className="h-5 w-5" aria-hidden />
              </div>
              <h3 className={`${heading} text-lg font-medium text-[#1A1A1A] md:text-xl mb-3`}>
                {f.title}
              </h3>
              <p className={`${body} text-sm leading-relaxed text-[#4A4A4A] md:text-[15px]`}>
                {f.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
