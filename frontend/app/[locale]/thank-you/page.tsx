"use client";

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { 
  CheckCircle2, 
  ArrowLeft, 
  LayoutGrid, 
  BookOpen, 
  MessageCircle, 
  Facebook, 
  Share2,
  Twitter,
  ExternalLink
} from 'lucide-react';

const NextStepCard = ({ icon: Icon, title, desc, link, external = false }: { icon: any, title: string, desc: string, link: string, external?: boolean }) => {
  const Content = (
    <div className="bg-[#F8F9FA] p-8 text-center hover:shadow-lg transition-all duration-500 group border border-transparent hover:border-[#D4AF37]/20 h-full flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#D4AF37] mb-6 group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-500 shadow-sm">
        <Icon size={28} />
      </div>
      <h4 className="text-lg mb-2 text-[#1A1A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>{title}</h4>
      <p className="text-gray-500 text-xs leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>{desc}</p>
    </div>
  );

  if (external) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block h-full">
        {Content}
      </a>
    );
  }

  return (
    <Link href={link} className="block h-full">
      {Content}
    </Link>
  );
};

export default function ThankYou() {
  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Meta Noindex
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.getElementsByTagName('head')[0].appendChild(meta);

    // Mock Conversion Tracking
    console.log("Tracking: GA Conversion Goal Triggered");
    console.log("Tracking: FB Pixel Lead Event Triggered");
    
    // Example for real implementation:
    // window.gtag('event', 'conversion', {'send_to': 'AW-CONVERSION_ID'});
    // window.fbq('track', 'Lead');

    return () => {
      document.getElementsByTagName('head')[0].removeChild(meta);
    };
  }, []);

  return (
    <div className="bg-white min-h-screen relative">
      {/* Hero Background */}
      <div className="absolute inset-0 h-[450px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-[#1A1A1A]"></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>
      
      {/* Main Content */}
      <section className="container mx-auto px-6 text-center max-w-4xl relative z-10 pt-40 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex justify-center mb-8"
        >
          <div className="w-20 h-20 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
            <CheckCircle2 size={80} className="text-[#D4AF37]" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 
            className="text-white mb-4" 
            style={{ fontSize: '48px', fontFamily: 'Playfair Display, serif' }}
          >
            Cảm ơn bạn đã tin tưởng!
          </h1>
          <p 
            className="text-white/80 text-xl mb-12 font-light" 
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Yêu cầu tư vấn của bạn đã được gửi thành công
          </p>

          <div className="bg-white p-8 md:p-12 shadow-xl border-t-4 border-[#D4AF37] inline-block text-left mb-16 max-w-2xl">
            <p className="text-[#1A1A1A] text-lg mb-4 font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Kiến trúc sư của XPRESS DESIGN sẽ liên hệ lại với bạn trong vòng 24 giờ.
            </p>
            <div className="h-[1px] bg-gray-200 w-full mb-6" />
            <p className="text-gray-500 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Nếu cần hỗ trợ ngay, vui lòng liên hệ Hotline: <span className="text-[#D4AF37] font-bold">0900.XXX.XXX</span>
            </p>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <h3 className="text-[#1A1A1A] text-xl mb-10 uppercase tracking-[0.2em] font-bold" style={{ fontSize: '18px' }}>
            Trong khi chờ đợi, bạn có thể...
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <NextStepCard 
              icon={LayoutGrid} 
              title="Dự án tiêu biểu" 
              desc="Khám phá những công trình kiến trúc đẳng cấp đã hoàn thành."
              link="/projects"
            />
            <NextStepCard 
              icon={BookOpen} 
              title="Cẩm nang thiết kế" 
              desc="Cập nhật xu hướng nội thất và kiến thức xây dựng mới nhất."
              link="/blog"
            />
            <NextStepCard 
              icon={MessageCircle} 
              title="Kết nối Zalo" 
              desc="Trò chuyện trực tiếp với đội ngũ tư vấn nhanh chóng."
              link="https://zalo.me"
              external
            />
            <NextStepCard 
              icon={Facebook} 
              title="Theo dõi Fanpage" 
              desc="Cập nhật những hình ảnh thi công thực tế mỗi ngày."
              link="https://facebook.com"
              external
            />
          </div>
        </motion.div>

        {/* Social Share */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-24 border-t border-gray-100 pt-16"
        >
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-6 font-bold">Chia sẻ cảm hứng với bạn bè</p>
          <div className="flex justify-center gap-4">
            <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition-all text-xs font-bold uppercase tracking-widest">
              <Facebook size={16} /> Facebook
            </button>
            <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37] transition-all text-xs font-bold uppercase tracking-widest">
              <Share2 size={16} /> Zalo
            </button>
            <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition-all text-xs font-bold uppercase tracking-widest">
              <Twitter size={16} /> Twitter
            </button>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-20"
        >
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#1A1A1A] transition-colors font-bold uppercase tracking-widest text-xs border-b border-[#D4AF37] pb-1"
          >
            <ArrowLeft size={16} /> Về trang chủ
          </Link>
        </motion.div>
      </section>

      {/* Embedded Pixel/Script Placeholders (Visual representation) */}
      <div className="hidden">
        {/*
          Google Analytics 4 Conversion Event
          window.gtag('event', 'generate_lead', {
            'value': 1.0,
            'currency': 'VND'
          });
          
          Facebook Pixel Lead Event
          fbq('track', 'Lead');
        */}
      </div>
    </div>
  );
}