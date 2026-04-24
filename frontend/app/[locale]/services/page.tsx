"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { PageHero } from '@/components/PageHero';
import { 
  CheckCircle2, 
  ChevronDown, 
  ArrowRight, 
  PencilRuler, 
  Home, 
  Hammer, 
  RefreshCcw,
  MessageSquare,
  FileText,
  MousePointer2,
  HardHat,
  Key
} from 'lucide-react';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left group transition-all duration-300"
      >
        <span className={`text-lg font-medium transition-colors duration-300 ${isOpen ? 'text-[#D4AF37]' : 'text-[#1A1A1A] group-hover:text-[#D4AF37]'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
          {question}
        </span>
        <ChevronDown 
          size={20} 
          className={`text-[#D4AF37] transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <p className="text-gray-500 pb-8 leading-relaxed pr-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Services() {
  const tNav = useTranslations('Nav');
  const tPage = useTranslations('PageTitles');
  const tTag = useTranslations('HeroTaglines');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      title: "Thiết kế Kiến trúc",
      icon: <PencilRuler size={32} />,
      img: "https://images.unsplash.com/photo-1746458258536-b9ee5db20a73",
      desc: "Kiến tạo không gian ngoại thất đẳng cấp, tối ưu hóa công năng và thẩm mỹ hiện đại.",
      highlights: ["Phân tích mặt bằng & phong thủy", "Thiết kế 3D kiến trúc ngoại thất", "Hồ sơ kỹ thuật thi công", "Giám sát tác quyền"]
    },
    {
      title: "Thiết kế Nội thất",
      icon: <Home size={32} />,
      img: "https://images.unsplash.com/photo-1728488448472-16a259c6ba7c",
      desc: "Thổi hồn vào không gian sống với gu thẩm mỹ tinh tế, vật liệu cao cấp và sự sang trọng.",
      highlights: ["Thiết kế concept không gian", "Lựa chọn vật liệu & màu sắc", "Thiết kế nội thất chi tiết", "Trang trí (Styling) nghệ thuật"]
    },
    {
      title: "Thi công trọn gói",
      icon: <Hammer size={32} />,
      img: "https://images.unsplash.com/photo-1606745994328-4ed824ded494",
      desc: "Hiện thực hóa bản vẽ với quy trình thi công chuyên nghiệp, đảm bảo tiến độ và chất lượng.",
      highlights: ["Quản lý dự án chuyên nghiệp", "Báo giá chi tiết & minh bạch", "Thi công theo đúng thiết kế", "Bảo hành dài hạn"]
    },
    {
      title: "Cải tạo & Phục dựng",
      icon: <RefreshCcw size={32} />,
      img: "https://images.unsplash.com/photo-1633354990288-2bfe9967da76",
      desc: "Làm mới không gian cũ, giữ lại giá trị truyền thống kết hợp tiện nghi hiện đại.",
      highlights: ["Khảo sát kết cấu hiện hữu", "Tối ưu hóa không gian sử dụng", "Nâng cấp hệ thống kỹ thuật", "Làm mới diện mạo hoàn toàn"]
    }
  ];

  const processSteps = [
    { number: "01", icon: <MessageSquare size={24} />, title: "Tư vấn & Khảo sát", desc: "Lắng nghe mong muốn và khảo sát thực địa để đưa ra giải pháp sơ bộ." },
    { number: "02", icon: <FileText size={24} />, title: "Thiết kế Concept", desc: "Xây dựng ý tưởng không gian qua các bản vẽ 3D minh họa trực quan." },
    { number: "03", icon: <MousePointer2 size={24} />, title: "Hồ sơ chi tiết", desc: "Hoàn thiện hồ sơ kỹ thuật, bóc tách khối lượng và dự toán thi công." },
    { number: "04", icon: <HardHat size={24} />, title: "Thi công & Giám sát", desc: "Triển khai xây dựng thực tế với sự giám sát chặt chẽ từ kiến trúc sư." },
    { number: "05", icon: <Key size={24} />, title: "Bàn giao & Bảo trì", desc: "Nghiệm thu công trình và thực hiện cam kết bảo hành sau thi công." }
  ];

  return (
    <div className="bg-white">
      <PageHero
        image="https://images.unsplash.com/photo-1582057811341-a22d524c6a4c"
        title={tPage('services')}
        breadcrumb={tNav('services')}
        homeLabel={tNav('home')}
        tagline={tTag('services')}
        alt="Services hero"
      />

      {/* Overview Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[#1A1A1A] mb-8" style={{ fontSize: '32px', fontFamily: 'Playfair Display, serif' }}>
              Kiến tạo giá trị thực qua từng bản vẽ
            </h2>
            <p className="text-gray-500 leading-relaxed text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Tại XPRESS DESIGN, chúng tôi cung cấp hệ sinh thái dịch vụ khép kín từ khâu tư vấn, thiết kế kiến trúc, nội thất cho đến thi công trọn gói. Với đội ngũ kiến trúc sư tâm huyết, chúng tôi cam kết mang đến những công trình không chỉ đạt chuẩn về kỹ thuật mà còn chạm đến đỉnh cao của nghệ thuật sống.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-[#F8F9FA]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white flex flex-col md:flex-row shadow-sm hover:shadow-xl transition-shadow duration-500 overflow-hidden group"
              >
                <div className="md:w-1/2 overflow-hidden relative">
                  <ImageWithFallback
                    src={service.img}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-6 left-6 bg-white/90 p-3 text-[#1A1A1A] rounded-sm">
                    {service.icon}
                  </div>
                </div>
                <div className="md:w-1/2 p-10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl mb-4 text-[#1A1A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {service.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {service.desc}
                    </p>
                    <ul className="space-y-3 mb-8">
                      {service.highlights.map((h, i) => (
                        <li key={i} className="flex items-center text-xs text-gray-700 font-medium">
                          <CheckCircle2 size={16} className="text-[#D4AF37] mr-3 shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button className="flex items-center text-[#D4AF37] text-xs uppercase tracking-widest font-bold group/btn">
                    Tìm hiểu thêm
                    <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-2 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-[#1A1A1A] text-white overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-white mb-4" style={{ fontSize: '36px', fontFamily: 'Playfair Display, serif' }}>
              Quy trình làm việc chuyên nghiệp — 5 bước
            </h2>
            <div className="w-24 h-1 bg-[#D4AF37] mx-auto" />
          </div>

          <div className="relative">
            {/* Desktop Line */}
            <div className="hidden lg:block absolute top-12 left-0 w-full h-[1px] bg-white/10 z-0" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 relative z-10">
              {processSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="text-center group"
                >
                  <div className="w-24 h-24 mx-auto rounded-full bg-[#2A2A2A] border border-white/5 flex items-center justify-center text-[#D4AF37] mb-8 group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-500 relative">
                    <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-[#D4AF37] text-white w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-[#1A1A1A]">
                      {step.number}
                    </span>
                    {step.icon}
                  </div>
                  <h4 className="text-lg mb-4 text-white" style={{ fontFamily: 'Playfair Display, serif' }}>{step.title}</h4>
                  <p className="text-white/40 text-sm leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <h2 className="text-[#1A1A1A] mb-8" style={{ fontSize: '36px', fontFamily: 'Playfair Display, serif' }}>
                Câu hỏi thường gặp
              </h2>
              <p className="text-gray-500 mb-12" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Chúng tôi tổng hợp những thắc mắc phổ biến từ khách hàng để giúp bạn có cái nhìn tổng quan nhất về dịch vụ của XPRESS DESIGN.
              </p>
              <div className="p-10 bg-[#F8F9FA] border-l-4 border-[#D4AF37]">
                <p className="text-[#1A1A1A] italic leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  "Sự hài lòng của khách hàng không chỉ là kết quả cuối cùng, mà là trải nghiệm xuyên suốt trong toàn bộ quá trình hợp tác."
                </p>
                <p className="mt-4 font-bold text-[#D4AF37] uppercase tracking-widest text-xs">- Đội ngũ XPRESS DESIGN</p>
              </div>
            </div>

            <div>
              <FAQItem 
                question="Chi phí thiết kế được tính như thế nào?"
                answer="Đơn giá thiết kế tại XPRESS DESIGN được tính dựa trên m2 sàn sử dụng. Chi phí thực tế sẽ phụ thuộc vào phong cách thiết kế (Modern, Classic, Minimalism...) và độ phức tạp của công trình. Chúng tôi luôn cung cấp báo giá chi tiết và cam kết không phát sinh chi phí ngoài hợp đồng."
              />
              <FAQItem 
                question="Thời gian hoàn thành một bộ hồ sơ thiết kế?"
                answer="Thông thường, một bộ hồ sơ thiết kế đầy đủ bao gồm kiến trúc, nội thất và kỹ thuật điện nước sẽ mất từ 45 đến 60 ngày làm việc. Thời gian này có thể thay đổi tùy thuộc vào quy mô dự án và tốc độ phản hồi, thống nhất phương án giữa khách hàng và kiến trúc sư."
              />
              <FAQItem 
                question="XPRESS DESIGN có nhận thiết kế ngoại tỉnh không?"
                answer="Chúng tôi nhận thực hiện các dự án trên toàn quốc. Đối với khách hàng ở xa, quy trình sẽ được linh hoạt kết hợp giữa làm việc online và các đợt khảo sát, giám sát trực tiếp định kỳ tại công trình để đảm bảo chất lượng thi công đúng bản vẽ."
              />
              <FAQItem 
                question="Chế độ bảo hành và bảo trì sau thi công?"
                answer="Đối với các dự án thi công trọn gói, chúng tôi cung cấp chế độ bảo hành 2 năm cho phần hoàn thiện n���i thất và lên đến 5 năm cho các hạng mục kết cấu xây dựng. Sau thời gian bảo hành, XPRESS DESIGN vẫn tiếp tục hỗ trợ bảo trì trọn đời với chi phí ưu đãi cho khách hàng cũ."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#1A1A1A] text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 
              className="text-white mb-8"
              style={{ fontSize: '36px', fontFamily: 'Playfair Display, serif' }}
            >
              Bạn đã sẵn sàng kiến tạo <br /> không gian mơ ước?
            </h2>
            <p className="text-white/50 mb-12 text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Hãy để chúng tôi đồng hành cùng bạn trên hành trình tạo dựng tổ ấm đẳng cấp và khác biệt.
            </p>
            <Link 
              href="/contact"
              className="bg-[#D4AF37] text-white px-12 py-5 uppercase tracking-[0.2em] text-sm font-bold hover:bg-white hover:text-[#1A1A1A] transition-all duration-500 inline-block"
            >
              Nhận báo giá ngay
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}