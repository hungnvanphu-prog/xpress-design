const body = "font-['Montserrat',sans-serif]";

type Props = {
  description: string;
};

export function ServiceIntro({ description }: Props) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className={`${body} text-base leading-[1.85] text-[#4A4A4A] md:text-lg`}>
          {description}
        </p>
      </div>
    </section>
  );
}
