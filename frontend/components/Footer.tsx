"use client";

import React, { useState } from 'react';
import { Facebook, Instagram } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { motion } from 'motion/react';

const QUICK_LINKS = [
  { name: 'Về chúng tôi', href: '/about' },
  { name: 'Dự án', href: '/projects' },
  { name: 'Dịch vụ', href: '/services' },
  { name: 'Góc nhìn', href: '/insights' },
  { name: 'Tin tức', href: '/news' },
  { name: 'Liên hệ', href: '/contact' },
];

const SERVICES = [
  'Thiết kế Kiến trúc',
  'Thiết kế Nội thất',
  'Thi công trọn gói',
  'Cải tạo',
];

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');

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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    console.log('Subscribe:', email);
    setEmail('');
  };

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
                Xpress Design
              </span>
              <span
                className="font-medium uppercase tracking-[0.2em] text-white/60 ml-2"
                style={{ ...fontMont, fontSize: '10px' }}
              >
                Architecture &amp; Interior
              </span>
            </div>

            <p
              className="text-white/55 leading-relaxed max-w-xs mb-6"
              style={{ ...fontMont, fontSize: '13px' }}
            >
              Giải pháp kiến trúc &amp; nội thất lấy con người làm trung tâm. Chúng tôi kiến tạo không gian, kiến tạo giá trị bền vững cho cuộc sống.
            </p>

            <address
              className="not-italic text-white/55 leading-relaxed mb-4"
              style={{ ...fontMont, fontSize: '13px' }}
            >
              Tòa nhà XPRESS, 123 Đường Nguyễn Huệ<br />
              Quận 1, TP. Hồ Chí Minh
            </address>

            <p className="text-white/55 mb-2" style={{ ...fontMont, fontSize: '13px' }}>
              Email:{' '}
              <a
                href="mailto:contact@xpressdesign.com"
                className="text-white/70 hover:text-[#D4AF37] transition-colors"
              >
                contact@xpressdesign.com
              </a>
            </p>
            <p
              className="text-[#D4AF37] font-bold"
              style={{ ...fontMont, fontSize: '14px' }}
            >
              Hotline:{' '}
              <a href="tel:0900123456" className="hover:underline">
                0900 123 456
              </a>
            </p>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div variants={itemVariants} className="flex flex-col items-start">
            <h4
              className="text-white mb-8 uppercase tracking-[0.2em] font-bold"
              style={{ ...fontMont, fontSize: '14px' }}
            >
              Liên kết nhanh
            </h4>
            <ul className="space-y-4">
              {QUICK_LINKS.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-white/55 hover:text-[#D4AF37] transition-colors duration-300"
                    style={{ ...fontMont, fontSize: '13px' }}
                  >
                    {item.name}
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
              Dịch vụ
            </h4>
            <ul className="space-y-4">
              {SERVICES.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-white/55 hover:text-[#D4AF37] transition-colors duration-300"
                    style={{ ...fontMont, fontSize: '13px' }}
                  >
                    {item}
                  </a>
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
              Kết nối với chúng tôi
            </h4>
            <div className="flex items-center space-x-3 mb-10">
              <a
                href="#"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
              >
                <Facebook size={16} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                aria-label="Zalo"
                className="px-4 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#1A1A1A] font-bold hover:brightness-110 transition"
                style={{ ...fontMont, fontSize: '12px' }}
              >
                Zalo
              </a>
            </div>

            <h4
              className="text-white mb-6 uppercase tracking-[0.2em] font-bold"
              style={{ ...fontMont, fontSize: '14px' }}
            >
              Đăng ký nhận tin
            </h4>
            <form
              onSubmit={handleSubscribe}
              className="w-full flex items-center border-b border-white/20 focus-within:border-[#D4AF37] transition-colors"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn..."
                className="flex-1 bg-transparent py-2 text-white/80 placeholder:text-white/40 focus:outline-none"
                style={{ ...fontMont, fontSize: '13px' }}
              />
              <button
                type="submit"
                className="px-2 py-2 text-white/70 hover:text-[#D4AF37] uppercase tracking-[0.2em] font-bold transition-colors"
                style={{ ...fontMont, fontSize: '11px' }}
              >
                Gửi
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
            © 2025 XPRESS DESIGN — All rights reserved
          </p>
        </motion.div>
      </motion.div>
    </footer>
  );
};