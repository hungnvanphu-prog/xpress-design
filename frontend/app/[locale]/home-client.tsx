"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { sanitizeCmsHtml } from "@/lib/sanitize-cms-html";
import type { toUiProject } from "@/lib/cms-transform";

type UiProject = ReturnType<typeof toUiProject>;

const CUSTOM_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUpVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: CUSTOM_EASE },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const serviceKeys = [
  "architecture",
  "interior",
  "construction",
  "renovation",
] as const;

const MOBILE_BREAKPOINT_MQ = "(max-width: 767px)";
const REDUCED_MOTION_MQ = "(prefers-reduced-motion: reduce)";

const INSIGHT_SLUGS: Record<string, [string, string, string]> = {
  en: [
    "5-sustainable-architecture-trends-2025",
    "minimal-interior",
    "urban-landscape-micro-climate",
  ],
  vi: [
    "5-xu-huong-kien-truc-ben-vung-2025",
    "noi-that-toi-gian",
    "canh-quan-do-thi-va-vi-khi-hau",
  ],
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1764083029048-75497d17f7eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmFsJTIwbGlnaHQlMjBzaGFkb3clMjBtaW5pbWFsJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzc2MzUzNDE2fDA&ixlib=rb-4.1.0&q=80&w=1920";
const INSIGHT_IMAGES: [string, string, string] = [
  "https://images.unsplash.com/photo-1595939465372-9ffed94dd4dd?q=80&w=1200",
  "https://images.unsplash.com/photo-1729335009895-bfe50bae5922?q=80&w=1200",
  "https://images.unsplash.com/photo-1597280683904-95d07f4237eb?q=80&w=1200",
];

interface HomeClientProps {
  featuredProjects: UiProject[];
}

/**
 * Fires when crossing 767px, not on every window resize — avoids re-renders while dragging the viewport.
 * Initial render stays `false` until mount (matches SSR) to avoid parallax style hydration mismatch.
 */
function useMobileLayoutForParallax() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BREAKPOINT_MQ);
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return isMobile;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(REDUCED_MOTION_MQ);
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

export default function HomeClient({ featuredProjects }: HomeClientProps) {
  const tHome = useTranslations("Home");
  const tProj = useTranslations("Projects");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const insightSlugs = INSIGHT_SLUGS[locale] ?? INSIGHT_SLUGS.en;

  const { scrollY } = useScroll();
  const isMobile = useMobileLayoutForParallax();
  const reduceMotion = usePrefersReducedMotion();
  const noParallax = isMobile || reduceMotion;

  const y = useTransform(scrollY, (v) => (noParallax ? 0 : (Math.min(1000, Math.max(0, v)) / 1000) * 300));
  const heroOpacity = useTransform(scrollY, (v) => {
    if (noParallax) return 0.6;
    if (v <= 0) return 0.3;
    if (v >= 600) return 0.9;
    return 0.3 + (v / 600) * 0.6;
  });
  const textY = useTransform(scrollY, (v) => (noParallax ? 0 : (Math.min(500, Math.max(0, v)) / 500) * 100));
  const textOpacity = useTransform(scrollY, (v) => {
    if (noParallax) return 1;
    if (v <= 0) return 1;
    if (v >= 300) return 0;
    return 1 - v / 300;
  });

  return (
    <div className="w-full relative bg-[#F8F9FA] text-[#1A1A1A] font-['Montserrat',sans-serif]">
      {/* 1. Cinematic Hero Section */}
      <section className="relative w-full h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-[#1A1A1A]">
        {/* Background Visual */}
        <motion.div
          className="absolute inset-0 origin-center"
          style={{ y, opacity: heroOpacity }}
        >
          <motion.div
            initial={reduceMotion ? false : { scale: 1.05 }}
            animate={{ scale: reduceMotion ? 1 : 1.15 }}
            transition={
              reduceMotion
                ? { duration: 0.2 }
                : {
                    duration: 30,
                    ease: "linear",
                    repeat: Infinity,
                    repeatType: "reverse",
                  }
            }
            className="w-full h-full"
          >
            <div className="relative h-full w-full">
              <Image
                src={HERO_IMAGE}
                alt={tHome("heroImageAlt")}
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-60 mix-blend-luminosity"
                quality={85}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Dark Overlay that intensifies on scroll */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/20 via-transparent to-[#1A1A1A]/80 pointer-events-none" />

        {/* Content */}
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="relative z-10 text-center px-6 md:px-12 max-w-4xl md:max-w-5xl mx-auto flex flex-col items-center justify-center pointer-events-none"
        >
          <motion.h1
            initial={{
              opacity: 0,
              filter: "blur(10px)",
              y: 10,
            }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1.8, ease: CUSTOM_EASE }}
            className="font-['Playfair_Display',serif] text-[44px] md:text-[80px] lg:text-[100px] leading-[1.1] text-white font-light tracking-tight mix-blend-difference"
          >
            {tHome("heroTitle")}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.55, ease: CUSTOM_EASE }}
            className="mt-8 md:mt-10 flex w-full max-w-2xl flex-col items-center gap-5 md:gap-6"
          >
            <div
              className="h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent md:w-20"
              aria-hidden
            />
            <p
              className="whitespace-pre-line text-center font-['Montserrat',sans-serif] text-[14px] font-light leading-[1.85] tracking-[0.04em] text-white/80 md:text-[16px] md:leading-[1.9] md:tracking-[0.06em]"
            >
              {tHome("heroSubtitle")}
            </p>
          </motion.div>
        </motion.div>

        {/* Minimalist CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1.5,
            delay: 1.2,
            ease: CUSTOM_EASE,
          }}
          style={{ opacity: textOpacity }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center"
        >
          <Link
            href="/projects"
            className="text-white/70 hover:text-white text-[10px] uppercase tracking-[0.25em] font-semibold transition-colors duration-500 pb-2 border-b border-white/20 hover:border-white"
          >
            {tHome("heroCta")}
          </Link>
        </motion.div>
      </section>

      {/* 2. Featured Projects Grid */}
      <section className="py-24 md:py-40 bg-[#1A1A1A] text-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
            className="mb-16 md:mb-24 flex flex-col md:flex-row items-start md:items-end justify-between gap-8"
          >
            <h2
              className="font-['Playfair_Display',serif] text-[36px] md:text-[56px] leading-[1.1] font-medium max-w-2xl text-white"
              dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(tHome("featured.title")) }}
            />
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-white/70 text-[11px] font-semibold uppercase tracking-[0.15em] hover:text-[#D4AF37] transition-colors pb-1 border-b border-transparent hover:border-[#D4AF37] group"
            >
              {tHome("featured.viewAll")}{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>

          {featuredProjects.length === 0 ? (
            <p className="text-white/60 text-[14px] uppercase tracking-[0.2em] text-center py-24">
              {tProj("empty")}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {featuredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1.2,
                    delay: index * 0.2,
                    ease: CUSTOM_EASE,
                  }}
                  className={`group relative block w-full overflow-hidden ${
                    index % 2 !== 0 ? "md:mt-32" : ""
                  }`}
                >
                  <Link
                    href={`/projects/${project.slug}`}
                    className="block h-[500px] md:h-[700px] overflow-hidden relative"
                  >
                    <ImageWithFallback
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {/* Hover Overlays */}
                    <div className="absolute inset-0 bg-[#D4AF37]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end pointer-events-none">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <p className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-bold mb-4">
                          {project.projectType
                            ? tProj(`filter.${project.projectType}` as any)
                            : project.category}
                          {project.year ? ` · ${project.year}` : ""}
                        </p>
                        <h3 className="font-['Playfair_Display',serif] text-3xl md:text-[40px] text-white mb-4">
                          {project.title}
                        </h3>
                        <div className="overflow-hidden">
                          <p className="text-white/80 text-[11px] uppercase tracking-[0.15em] font-semibold transform translate-y-[150%] group-hover:translate-y-0 transition-transform duration-500 ease-out flex items-center gap-2">
                            {tCommon("readMore")} <ArrowRight size={14} />
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. About / Storytelling */}
      <section className="py-32 md:py-48 px-6 md:px-12 bg-white flex items-center justify-center text-center">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: CUSTOM_EASE }}
          >
            <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase mb-12 block">
              {tHome("philosophyEyebrow")}
            </span>
            <h2 className="font-['Playfair_Display',serif] text-[32px] md:text-[52px] leading-[1.3] text-[#1A1A1A] font-medium mb-16">
              {tHome("philosophyQuote")}
            </h2>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-[#1A1A1A] font-bold text-[11px] uppercase tracking-[0.2em] hover:text-[#D4AF37] transition-colors pb-2 border-b border-[#1A1A1A] hover:border-[#D4AF37] group"
            >
              {tHome("philosophyCta")}{" "}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 4. Services Clean List */}
      <section className="py-24 md:py-32 bg-[#F8F9FA]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
            className="mb-16 md:mb-24"
          >
            <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 block">
              {tHome("servicesEyebrow")}
            </span>
            <h2 className="font-['Playfair_Display',serif] text-[36px] md:text-[56px] text-[#1A1A1A] font-medium">
              {tHome("servicesTitle")}
            </h2>
          </motion.div>

          <div className="border-t border-gray-200">
            {serviceKeys.map((key, index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 1.2,
                  delay: index * 0.1,
                  ease: CUSTOM_EASE,
                }}
                className="group border-b border-gray-200 hover:border-[#D4AF37] transition-colors duration-500"
              >
                <Link
                  href="/services"
                  className="flex flex-col md:flex-row md:items-center py-10 md:py-14 gap-6 md:gap-12 cursor-pointer"
                >
                  <span className="text-gray-300 font-['Playfair_Display',serif] text-3xl md:text-5xl group-hover:text-[#D4AF37] transition-colors duration-500 w-[80px]">
                    {tHome(`services.${key}.num`)}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-[28px] md:text-[40px] font-['Playfair_Display',serif] text-[#1A1A1A] mb-4 group-hover:text-[#D4AF37] transition-colors duration-500">
                      {tHome(`services.${key}.title`)}
                    </h3>
                    <p className="text-[#4A4A4A] text-[15px] font-light max-w-xl leading-relaxed">
                      {tHome(`services.${key}.desc`)}
                    </p>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full border border-gray-200 group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37] transition-all duration-500">
                    <ArrowRight
                      size={24}
                      className="text-gray-400 group-hover:text-white transform -rotate-45 group-hover:rotate-0 transition-all duration-500"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Insights */}
      <section className="py-24 md:py-40 px-6 md:px-12 bg-white">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
            className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-16 md:mb-24"
          >
            <div>
              <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 block">
                {tHome("insightsEyebrow")}
              </span>
              <h2 className="font-['Playfair_Display',serif] text-[36px] md:text-[56px] text-[#1A1A1A] font-medium leading-tight">
                {tHome("insightsTitleLine1")}
                <br />
                {tHome("insightsTitleLine2")}
              </h2>
            </div>
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-[#1A1A1A] text-[11px] font-bold uppercase tracking-[0.15em] hover:text-[#D4AF37] transition-colors pb-1 border-b border-transparent hover:border-[#D4AF37] group"
            >
              {tHome("insightsViewAll")}{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12"
          >
            {/* Bài 1 */}
            <motion.article
              variants={fadeUpVariant}
              className="group cursor-pointer flex h-full flex-col"
            >
              <Link
                href={`/insights/${insightSlugs[0]}`}
                className="relative mb-8 block aspect-[4/5] overflow-hidden bg-gray-100"
              >
                <Image
                  src={INSIGHT_IMAGES[0]}
                  alt={tHome("insights.card1.imageAlt")}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
              </Link>
              <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 block">
                {tHome("insights.card1.category")}
              </span>
              <Link href={`/insights/${insightSlugs[0]}`}>
                <h3 className="font-['Playfair_Display',serif] text-[24px] text-[#1A1A1A] mb-4 group-hover:text-[#D4AF37] transition-colors leading-snug font-medium">
                  {tHome("insights.card1.title")}
                </h3>
              </Link>
              <p className="text-[#4A4A4A] text-[15px] leading-relaxed font-light">
                {tHome("insights.card1.desc")}
              </p>
            </motion.article>

            {/* Bài 2 */}
            <motion.article
              variants={fadeUpVariant}
              className="group cursor-pointer flex h-full flex-col"
            >
              <Link
                href={`/insights/${insightSlugs[1]}`}
                className="relative mb-8 block aspect-[4/5] overflow-hidden bg-gray-100"
              >
                <Image
                  src={INSIGHT_IMAGES[1]}
                  alt={tHome("insights.card2.imageAlt")}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
              </Link>
              <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 block">
                {tHome("insights.card2.category")}
              </span>
              <Link href={`/insights/${insightSlugs[1]}`}>
                <h3 className="font-['Playfair_Display',serif] text-[24px] text-[#1A1A1A] mb-4 group-hover:text-[#D4AF37] transition-colors leading-snug font-medium">
                  {tHome("insights.card2.title")}
                </h3>
              </Link>
              <p className="text-[#4A4A4A] text-[15px] leading-relaxed font-light">
                {tHome("insights.card2.desc")}
              </p>
            </motion.article>

            {/* Bài 3 */}
            <motion.article
              variants={fadeUpVariant}
              className="group cursor-pointer flex h-full flex-col"
            >
              <Link
                href={`/insights/${insightSlugs[2]}`}
                className="relative mb-8 block aspect-[4/5] overflow-hidden bg-gray-100"
              >
                <Image
                  src={INSIGHT_IMAGES[2]}
                  alt={tHome("insights.card3.imageAlt")}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
              </Link>
              <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 block">
                {tHome("insights.card3.category")}
              </span>
              <Link href={`/insights/${insightSlugs[2]}`}>
                <h3 className="font-['Playfair_Display',serif] text-[24px] text-[#1A1A1A] mb-4 group-hover:text-[#D4AF37] transition-colors leading-snug font-medium">
                  {tHome("insights.card3.title")}
                </h3>
              </Link>
              <p className="text-[#4A4A4A] text-[15px] leading-relaxed font-light">
                {tHome("insights.card3.desc")}
              </p>
            </motion.article>
          </motion.div>
        </div>
      </section>

      {/* 6. Final CTA */}
      <section className="py-32 md:py-48 bg-[#1A1A1A] text-white text-center px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: CUSTOM_EASE }}
          >
            <h2 className="font-['Playfair_Display',serif] text-[40px] md:text-[64px] font-medium mb-10 leading-[1.1]">
              {tHome("finalCtaTitleLine1")}
              <br />
              {tHome("finalCtaTitleLine2")}
            </h2>
            <p className="text-white/70 text-[16px] md:text-[20px] font-light mb-16 max-w-2xl mx-auto">
              {tHome("finalCtaBody")}
            </p>
            <Link
              href="/contact"
              className="group relative inline-flex items-center justify-center bg-[#D4AF37] text-[#1A1A1A] px-12 py-5 uppercase tracking-[0.2em] text-[13px] font-bold overflow-hidden transition-all duration-500 hover:bg-white hover:scale-105"
            >
              <span>{tHome("finalCtaButton")}</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
