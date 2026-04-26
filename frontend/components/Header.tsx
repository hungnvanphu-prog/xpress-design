"use client";

import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations('Nav');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { key: 'home', href: '/' as const },
    { key: 'about', href: '/about' as const },
    { key: 'services', href: '/services' as const },
    { key: 'projects', href: '/projects' as const },
    { key: 'insights', href: '/insights' as const },
    { key: 'news', href: '/news' as const },
    { key: 'contact', href: '/contact' as const },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-[#1A1A1A] py-4 shadow-lg' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <Logo color="white" className="!items-start cursor-pointer hover:opacity-80 transition-opacity" />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center space-x-10">
          {menuItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              data-e2e={`nav-link-${item.key}`}
              className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/85 hover:text-[#D4AF37] transition-colors duration-300"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {t(item.key)}
            </Link>
          ))}
          <LanguageSwitcher variant="desktop" />
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#1A1A1A] border-t border-white/10 px-6 py-8 flex flex-col space-y-6">
          {menuItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              data-e2e={`nav-link-${item.key}`}
              className="text-white text-sm uppercase tracking-[0.2em] font-bold hover:text-[#D4AF37] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {t(item.key)}
            </Link>
          ))}
          <LanguageSwitcher variant="mobile" />
        </div>
      )}
    </header>
  );
};
