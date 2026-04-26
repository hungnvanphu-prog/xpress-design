"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Compass } from "lucide-react";

const heading = "font-['Playfair_Display',serif]";
const body = "font-['Montserrat',sans-serif]";

const RING_R = 52;
const RING_C = 2 * Math.PI * RING_R;

function AutoRedirectCountdown() {
  const t = useTranslations("NotFound");
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [cancelled, setCancelled] = useState(false);
  const [remaining, setRemaining] = useState(5);
  const redirectingRef = useRef(false);

  const cancel = useCallback(() => {
    setCancelled(true);
  }, []);

  useEffect(() => {
    if (cancelled) return;
    if (remaining <= 0) {
      if (!redirectingRef.current) {
        redirectingRef.current = true;
        router.replace("/");
      }
      return;
    }
    const id = window.setTimeout(() => {
      setRemaining((r) => r - 1);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [remaining, cancelled, router]);

  if (cancelled) {
    return (
      <p
        className={`${body} mt-2 text-center text-sm leading-relaxed text-[#4A4A4A] sm:text-base`}
        role="status"
        aria-live="polite"
      >
        {t("cancelledMessage")}
      </p>
    );
  }

  const progress = remaining / 5;
  const dash = progress * RING_C;

  return (
    <div
      className="relative mx-auto mt-8 w-full max-w-md rounded-2xl border border-[#1A1A1A]/8 bg-white p-6 shadow-[0_8px_30px_rgba(26,26,26,0.06)] sm:mt-10 sm:p-8"
      role="region"
      aria-label={t("countdownRegionLabel")}
    >
      <button
        type="button"
        onClick={cancel}
        className={`${body} sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-20 focus:rounded-md focus:bg-[#1A1A1A] focus:px-3 focus:py-2 focus:text-xs focus:text-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#D4AF37]`}
      >
        {t("skipToActions")}
      </button>

      <div className="flex flex-col items-center gap-5">
        <div className="relative flex h-[132px] w-[132px] items-center justify-center sm:h-[148px] sm:w-[148px]">
          <svg
            className="absolute left-0 top-0 h-full w-full -rotate-90"
            viewBox="0 0 120 120"
            aria-hidden
          >
            <circle
              cx="60"
              cy="60"
              r={RING_R}
              fill="none"
              stroke="#1A1A1A"
              strokeOpacity="0.08"
              strokeWidth="5"
            />
            <circle
              cx="60"
              cy="60"
              r={RING_R}
              fill="none"
              stroke="#D4AF37"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${RING_C}`}
              className={
                reduceMotion ? "" : "transition-[stroke-dasharray] duration-700 ease-out"
              }
            />
          </svg>
          <span
            className={`${heading} relative z-[1] text-5xl font-medium tabular-nums text-[#1A1A1A] sm:text-6xl`}
            aria-live="polite"
            aria-atomic="true"
          >
            {remaining}
          </span>
        </div>

        <div className="space-y-2 text-center">
          <p
            className={`${body} text-sm font-medium leading-snug text-[#1A1A1A] sm:text-base`}
          >
            {t("countdownLine", { seconds: remaining })}
          </p>
          <p className={`${body} text-xs text-[#4A4A4A] sm:text-sm`}>
            {t("countdownSubline")}
          </p>
        </div>

        <button
          type="button"
          onClick={cancel}
          className={`${body} rounded-full border border-[#1A1A1A]/20 bg-[#F8F9FA] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#1A1A1A] transition-colors hover:border-[#D4AF37]/50 hover:bg-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#D4AF37] sm:text-sm`}
        >
          {t("cancelCta")}
        </button>
      </div>
    </div>
  );
}

/**
 * Trang 404 production — đa ngôn ngữ, countdown 5s về trang chủ (có hủy), đồng bộ XPRESS DESIGN.
 */
export function NotFoundView() {
  const t = useTranslations("NotFound");
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="bg-[#F8F9FA] px-4 pb-12 pt-10 sm:px-6 sm:pt-14 md:pb-20 md:pt-[120px]"
      data-e2e="not-found"
    >
      <div className="mx-auto max-w-3xl text-center">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`${body} mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D4AF37] sm:mb-5 sm:text-xs`}
        >
          {t("eyebrow")}
        </motion.p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          <p
            className={`${heading} max-[400px]:text-[4.5rem] text-[6.5rem] font-medium leading-none tracking-tight text-[#D4AF37]/90 [text-shadow:0_2px_40px_rgba(212,175,55,0.18)] sm:text-[7.5rem] md:text-[9.5rem] select-none`}
            aria-hidden
          >
            <motion.span
              className="inline-block will-change-transform"
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [1, 1.02, 1] }
              }
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }
            >
              404
            </motion.span>
          </p>

          <div className="-mt-1 mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-white/90 text-[#D4AF37] shadow-sm sm:mb-5 sm:h-[72px] sm:w-[72px]">
            <Compass className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={1.25} aria-hidden />
          </div>
        </motion.div>

        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className={`${heading} mt-2 text-[1.625rem] font-medium leading-tight text-[#1A1A1A] sm:text-3xl md:text-4xl`}
        >
          {t("headline")}
        </motion.h1>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.45 }}
          className={`${body} mx-auto mt-4 max-w-[520px] text-base leading-[1.65] text-[#4A4A4A] sm:text-lg`}
        >
          {t("description")}
        </motion.p>

        <AutoRedirectCountdown />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.45 }}
          className={`${body} mt-10 flex flex-col items-stretch justify-center gap-4 sm:mt-12 sm:flex-row sm:items-center sm:gap-4`}
        >
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#D4AF37] px-8 py-3 text-base font-bold text-[#1A1A1A] transition-transform hover:scale-[1.02] hover:bg-[#C5A028] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#1A1A1A] active:scale-[0.99]"
          >
            {t("backHome")}
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-[#D4AF37] bg-transparent px-8 py-3 text-base font-medium text-[#1A1A1A] transition-colors hover:bg-[#D4AF37]/10 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#D4AF37]"
          >
            {t("contactSupport")}
          </Link>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className={`${body} mt-12 border-t border-[#1A1A1A]/6 pt-10 sm:mt-14`}
        >
          <p className="text-sm text-[#888888]">{t("suggestedTitle")}</p>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
            <li>
              <Link
                href="/projects"
                className="font-medium text-[#D4AF37] underline-offset-4 transition-colors hover:underline"
              >
                {t("linkProjects")}
              </Link>
            </li>
            <li className="text-[#D4AF37]/40" aria-hidden>
              ·
            </li>
            <li>
              <Link
                href="/insights"
                className="font-medium text-[#D4AF37] underline-offset-4 transition-colors hover:underline"
              >
                {t("linkInsights")}
              </Link>
            </li>
            <li className="text-[#D4AF37]/40" aria-hidden>
              ·
            </li>
            <li>
              <Link
                href="/services"
                className="font-medium text-[#D4AF37] underline-offset-4 transition-colors hover:underline"
              >
                {t("linkServices")}
              </Link>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

export default NotFoundView;
