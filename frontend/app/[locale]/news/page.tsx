"use client";

import { motion } from "motion/react";
import { ArrowRight, ChevronRight, MapPin, Tag } from "lucide-react";
import { Link } from '@/i18n/navigation';

export default function News() {
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  const newsItems = [
    {
      id: 1,
      day: "15",
      monthYear: "Th04 / 2025",
      image: "https://images.unsplash.com/photo-1759866042499-d0b3e9d87ceb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmUlMjBhd2FyZCUyMHRyb3BoeSUyMGNyeXN0YWx8ZW58MXx8fHwxNzc2MjQ0MTUzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Dự án Villa Sen Vàng của XPRESS DESIGN đoạt giải Kiến trúc Xanh 2025",
      summary: "Hội Kiến trúc sư Việt Nam vừa trao giải cho công trình biệt thự sử dụng năng lượng hiệu quả, thiết kế thông minh và có tính bền vững cao.",
      category: "Giải thưởng"
    },
    {
      id: 2,
      day: "01",
      monthYear: "Th03 / 2025",
      image: "https://images.unsplash.com/photo-1769034432267-0fd4a01d839f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmUlMjBkZXNpZ24lMjB3b3Jrc2hvcCUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NzYyNDQxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "XPRESS DESIGN tổ chức workshop 'Xu hướng nội thất 2025'",
      summary: "Sự kiện thu hút hơn 50 KTS trẻ và chủ đầu tư tham gia, chia sẻ về tương lai của không gian sống, từ vật liệu sinh thái đến công nghệ smarthome.",
      category: "Sự kiện"
    },
    {
      id: 3,
      day: "10",
      monthYear: "Th01 / 2025",
      image: "https://images.unsplash.com/photo-1769433360594-ec48a59b58bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBjaGFyaXR5JTIwZXZlbnQlMjBydXJhbCUyMGFzaWFuJTIwaG91c2V8ZW58MXx8fHwxNzc2MjQ0MTUzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Chung tay xây nhà tình thương cho gia đình khó khăn tại Quảng Nam",
      summary: "XPRESS DESIGN tài trợ thiết kế và thi công 2 căn nhà cho hộ nghèo, với tổng giá trị 500 triệu đồng. Hoạt động thường niên hướng về cộng đồng.",
      category: "Cộng đồng"
    },
    {
      id: 4,
      day: "05",
      monthYear: "Th12 / 2024",
      image: "https://images.unsplash.com/photo-1762968269894-1d7e1ce8894e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNvbmZlcmVuY2UlMjBwcmVzZW50YXRpb24lMjBzdGFnZXxlbnwxfHx8fDE3NzYyNDQxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "XPRESS DESIGN tham dự Hội thảo 'Kiến trúc bền vững Đông Nam Á' tại Singapore",
      summary: "Đại diện công ty trình bày tham luận về giải pháp tiết kiệm năng lượng cho nhà phố nhiệt đới, thu hút sự quan tâm của giới chuyên môn khu vực.",
      category: "Hội thảo"
    }
  ];

  return (
    <div className="w-full relative bg-[#F8F9FA] min-h-screen">
      
      {/* Hero Header */}
      <section className="relative h-[450px] pt-20 w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1648775933902-f633de370964?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmUlMjBtb2Rlcm4lMjBpbnRlcmlvciUyMG5ld3N8ZW58MXx8fHwxNzc2MjQ4NzMyfDA&ixlib=rb-4.1.0&q=80&w=1080)' }}></div>
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="relative z-10 text-center px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-white mb-4"
            style={{ fontSize: '48px', fontFamily: 'Playfair Display, serif' }}
          >
            Tin tức & Sự kiện
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="flex items-center justify-center space-x-2 text-white/80 text-sm uppercase tracking-widest font-medium mb-6">
              <Link href="/" className="hover:text-[#D4AF37] transition-colors">Trang chủ</Link>
              <span className="text-[#D4AF37]">/</span>
              <span className="text-white">Tin tức</span>
            </div>
            <p className="text-white/80 uppercase tracking-[0.3em] text-xs font-bold">
              Hoạt động nổi bật, giải thưởng và dấu ấn của Xpress Design
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. Danh sách tin tức (Timeline List) */}
      <section className="py-16 md:py-32 px-6 md:px-12 max-w-[1200px] mx-auto relative">
        <div className="flex flex-col gap-16 md:gap-24">
          
          {/* Vertical Timeline Line Background (Desktop Only) */}
          <div className="hidden md:block absolute left-[150px] lg:left-[224px] top-32 bottom-32 w-px bg-gray-200 -z-10" />

          {newsItems.map((item, index) => (
            <motion.article 
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="flex flex-col md:flex-row gap-6 md:gap-12 lg:gap-20 items-start group cursor-pointer"
            >
              
              {/* Date Column */}
              <div className="flex-shrink-0 w-auto md:w-24 lg:w-32 flex flex-row md:flex-col items-baseline md:items-end gap-2 md:gap-1 text-left md:text-right relative">
                {/* Timeline Dot (Desktop Only) */}
                <div className="hidden md:block absolute right-[-24px] lg:right-[-40px] top-6 w-3 h-3 bg-[#D4AF37] rounded-full ring-4 ring-white transition-transform duration-300 group-hover:scale-150 group-hover:bg-[#1A1A1A]" />
                
                <span className="font-['Playfair_Display',serif] text-4xl md:text-5xl text-[#D4AF37] font-medium group-hover:text-[#1A1A1A] transition-colors">
                  {item.day}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-1">
                  {item.monthYear}
                </span>
              </div>

              {/* Image Column */}
              <div className="w-full md:w-1/3 lg:w-1/4 aspect-[4/3] overflow-hidden bg-gray-100 flex-shrink-0 relative">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">
                  {item.category}
                </div>
              </div>

              {/* Content Column */}
              <div className="flex-1 flex flex-col justify-center pt-2 md:pt-4">
                <h2 className="font-['Playfair_Display',serif] text-2xl md:text-3xl text-[#1A1A1A] mb-4 group-hover:text-[#D4AF37] transition-colors line-clamp-2 md:line-clamp-none font-medium">
                  {item.title}
                </h2>
                <p className="text-[#4A4A4A] text-[15px] leading-relaxed mb-6 font-light">
                  {item.summary}
                </p>
                <div className="mt-auto">
                  <span className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.1em] text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors pb-1 border-b border-transparent group-hover:border-[#D4AF37]">
                    Xem chi tiết <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>

            </motion.article>
          ))}
        </div>

        {/* 4. Phân trang (Pagination) */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center items-center gap-2 mt-24 pt-16 border-t border-gray-200"
        >
          <button className="w-10 h-10 flex items-center justify-center border border-gray-300 text-gray-400 hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors disabled:opacity-50" disabled>
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center bg-[#1A1A1A] text-white text-sm font-semibold">1</button>
          <button className="w-10 h-10 flex items-center justify-center border border-gray-300 text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors text-sm font-semibold">2</button>
          <button className="w-10 h-10 flex items-center justify-center border border-gray-300 text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors text-sm font-semibold">3</button>
          <span className="text-gray-400 px-1">...</span>
          <button className="w-10 h-10 flex items-center justify-center border border-gray-300 text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors text-sm font-semibold">8</button>
          <button className="w-10 h-10 flex items-center justify-center border border-gray-300 text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors">
            <ChevronRight size={16} />
          </button>
        </motion.div>
      </section>

    </div>
  );
}