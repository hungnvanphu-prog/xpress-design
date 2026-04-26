"use client";

import React, { useState } from 'react';
import { Facebook, Instagram } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { api } from '@/lib/api';

const QUICK_LINKS = [
  { href: '/about', navKey: 'about' },
  { href: '/projects', navKey: 'projects' },
  { href: '/services', navKey: 'services' },
  { href: '/insights', navKey: 'insights' },
  { href: '/news', navKey: 'news' },
  { href: '/contact', navKey: 'contact' },
] as const;

const SERVICE_ITEMS = [
  { msgKey: 'serviceArchitecture' as const },
  { msgKey: 'serviceInterior' as const },
  { msgKey: 'serviceTurnkey' as const },
  { msgKey: 'serviceRenovation' as const },
] as const;

export const Footer: React.FC = () => {
  const t = useTranslations('Footer');
  const tNav = useTranslations('Nav');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<
    'idle' | 'loading' | 'ok' | 'error'
  >('idle');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
  };

  const fontMont = { fontFamily: 'Montserrat, sans-serif' } as const;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = email.trim();
    if (!em) return;
    setNewsletterStatus('loading');
    try {
      await api.cmsInsightSignup({
        email: em,
        source: 'site_footer',
        locale,
      });
      setEmail('');
      setNewsletterStatus('ok');
      setTimeout(() => setNewsletterStatus('idle'), 4000);
    } catch {
      setNewsletterStatus('error');
    }
  };

  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1A1A] text-white py-20 px-6 overflow-hidden">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="container mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10 pb-14">

          {/* Column 1: Brand & Contact */}
          <motion.div variants={itemVariants} className="flex flex-col items-start">
            <div className="mb-6 leading-tight">
              <span
                className="font-bold uppercase tracking-[0.05em] text-white"
                style={{ ...fontMont, fontSize: '22px' }}
              >
                {t('brandName')}
              </span>
              <span
                className="font-medium uppercase tracking-[0.2em] text-white/60 ml-2"
                style={{ ...fontMont, fontSize: '10px' }}
              >
                {t('brandSubtitle')}
              </span>
            </div>

            <p
              className="text-white/55 leading-relaxed max-w-xs mb-6"
              style={{ ...fontMont, fontSize: '13px' }}
            >
              {t('tagline')}
            </p>

            <address
              className="not-italic text-white/55 leading-relaxed mb-4"
              style={{ ...fontMont, fontSize: '13px' }}
            >
              {t('addressLine1')}
              <br />
              {t('addressLine2')}
            </address>

            <p className="text-white/55 mb-2" style={{ ...fontMont, fontSize: '13px' }}>
              {t('emailLabel')}{' '}
              <a
                href={`mailto:${t('email')}`}
                className="text-white/70 hover:text-[#D4AF37] transition-colors"
              >
                {t('email')}
              </a>
            </p>
            <p
              className="text-[#D4AF37] font-bold"
              style={{ ...fontMont, fontSize: '14px' }}
            >
              {t('hotlineLabel')}{' '}
              <a href={`tel:${t('hotlineTel')}`} className="hover:underline">
                {t('hotlineDisplay')}
              </a>
            </p>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div variants={itemVariants} className="flex flex-col items-start">
            <h4
              className="text-white mb-8 uppercase tracking-[0.2em] font-bold"
              style={{ ...fontMont, fontSize: '14px' }}
            >
              {t('quickLinksTitle')}
            </h4>
            <ul className="space-y-4">
              {QUICK_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/55 hover:text-[#D4AF37] transition-colors duration-300"
                    style={{ ...fontMont, fontSize: '13px' }}
                  >
                    {tNav(item.navKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Services */}
          <motion.div variants={itemVariants} className="flex flex-col items-start">
            <h4
              className="text-white mb-8 uppercase tracking-[0.2em] font-bold"
              style={{ ...fontMont, fontSize: '14px' }}
            >
              {t('servicesTitle')}
            </h4>
            <ul className="space-y-4">
              {SERVICE_ITEMS.map((item) => (
                <li key={item.msgKey}>
                  <Link
                    href="/services"
                    className="text-white/55 hover:text-[#D4AF37] transition-colors duration-300"
                    style={{ ...fontMont, fontSize: '13px' }}
                  >
                    {t(item.msgKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Social + Newsletter */}
          <motion.div variants={itemVariants} className="flex flex-col items-start">
            <h4
              className="text-white mb-6 uppercase tracking-[0.2em] font-bold"
              style={{ ...fontMont, fontSize: '14px' }}
            >
              {t('connectTitle')}
            </h4>
            <div className="flex items-center space-x-3 mb-10">
              <a
                href="#"
                aria-label={t('ariaFacebook')}
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
              >
                <Facebook size={16} />
              </a>
              <a
                href="#"
                aria-label={t('ariaInstagram')}
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                aria-label={t('zaloButton')}
                className="px-4 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#1A1A1A] font-bold hover:brightness-110 transition"
                style={{ ...fontMont, fontSize: '12px' }}
              >
                {t('zaloButton')}
              </a>
            </div>

            <h4
              className="text-white mb-6 uppercase tracking-[0.2em] font-bold"
              style={{ ...fontMont, fontSize: '14px' }}
            >
              {t('newsletterTitle')}
            </h4>
            {newsletterStatus === 'ok' ? (
              <p className="text-[#D4AF37] text-[13px] mb-2" style={fontMont}>
                {t('newsletterThanks')}
              </p>
            ) : null}
            {newsletterStatus === 'error' ? (
              <p className="text-red-300 text-[13px] mb-2" style={fontMont}>
                {t('newsletterError')}
              </p>
            ) : null}
            <form
              onSubmit={handleSubscribe}
              className="w-full flex items-center border-b border-white/20 focus-within:border-[#D4AF37] transition-colors"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('newsletterPlaceholder')}
                disabled={newsletterStatus === 'loading'}
                className="flex-1 bg-transparent py-2 text-white/80 placeholder:text-white/40 focus:outline-none disabled:opacity-60"
                style={{ ...fontMont, fontSize: '13px' }}
              />
              <button
                type="submit"
                disabled={newsletterStatus === 'loading'}
                className="px-2 py-2 text-white/70 hover:text-[#D4AF37] uppercase tracking-[0.2em] font-bold transition-colors disabled:opacity-60"
                style={{ ...fontMont, fontSize: '11px' }}
              >
                {newsletterStatus === 'loading' ? t('newsletterSending') : t('newsletterSubmit')}
              </button>
            </form>
          </motion.div>

        </div>

        {/* Bottom Bar */}
        <motion.div
          variants={itemVariants}
          className="border-t border-white/10 pt-8 text-center"
        >
          <p
            className="text-white/40 uppercase tracking-[0.25em]"
            style={{ ...fontMont, fontSize: '11px' }}
          >
            {t('copyright', { year })}
          </p>
        </motion.div>
      </motion.div>
    </footer>
  );
};
