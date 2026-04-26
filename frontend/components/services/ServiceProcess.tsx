import type { ProcessStep } from '@/data/services';

const heading = "font-['Playfair_Display',serif]";
const body = "font-['Montserrat',sans-serif]";

type Props = {
  title: string;
  steps: ProcessStep[];
};

export function ServiceProcess({ title, steps }: Props) {
  return (
    <section className="bg-[#1A1A1A] py-20 text-white md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className={`${heading} text-center text-2xl font-medium md:text-4xl max-w-2xl mx-auto mb-4 md:mb-6`}
        >
          {title}
        </h2>
        <div className="mx-auto mb-14 h-1 w-16 bg-[#D4AF37]" aria-hidden />

        <ol className="grid grid-cols-1 gap-10 md:gap-12">
          {steps.map((s) => (
            <li
              key={s.step + s.title}
              className="flex flex-col gap-4 border-b border-white/10 pb-10 last:border-0 last:pb-0 md:flex-row md:items-start md:gap-10"
            >
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#D4AF37] text-sm font-bold text-[#D4AF37]"
                aria-hidden
              >
                {s.step}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`${heading} text-lg font-medium text-white md:text-xl mb-2`}>
                  {s.title}
                </h3>
                <p className={`${body} text-sm leading-relaxed text-white/60 md:text-[15px]`}>
                  {s.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
