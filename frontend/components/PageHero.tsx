"use client";

import React from "react";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";

type PageHeroProps = {
  /** Ảnh nền hero */
  image: string;
  /** Tiêu đề chính (h1) */
  title: string;
  /** Nhãn cho breadcrumb mục hiện tại (ví dụ: "Tin tức", "Về chúng tôi") */
  breadcrumb: string;
  /** Nhãn cho link "Trang chủ" (đa ngôn ngữ) */
  homeLabel: string;
  /** Tagline uppercase phía dưới breadcrumb */
  tagline?: string;
  /** Alt text cho ảnh nền (phục vụ SEO / a11y) */
  alt?: string;
};

/**
 * Hero header dùng chung cho các trang nội dung (news / about / services / contact / ...)
 * Style chuẩn hóa theo trang News:
 *   - h-[450px], pt-20, overlay đen 60%
 *   - Tiêu đề Playfair Display 48px
 *   - Breadcrumb: Trang chủ / <mục hiện tại>
 *   - Tagline uppercase tracking rộng
 */
export const PageHero: React.FC<PageHeroProps> = ({
  image,
  title,
  breadcrumb,
  homeLabel,
  tagline,
  alt = "",
}) => {
  return (
    <section className="relative h-[450px] pt-20 w-full flex items-center justify-center overflow-hidden">
      <div
        role="img"
        aria-label={alt || title}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white mb-4"
          style={{ fontSize: "48px", fontFamily: "Playfair Display, serif" }}
        >
          {title}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center justify-center"
        >
          <div className="flex items-center justify-center space-x-2 text-white/80 text-sm uppercase tracking-widest font-medium mb-6">
            <Link href="/" className="hover:text-[#D4AF37] transition-colors">
              {homeLabel}
            </Link>
            <span className="text-[#D4AF37]">/</span>
            <span className="text-white">{breadcrumb}</span>
          </div>

          {tagline ? (
            <p className="text-white/80 uppercase tracking-[0.3em] text-xs font-bold">
              {tagline}
            </p>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
};

export default PageHero;
