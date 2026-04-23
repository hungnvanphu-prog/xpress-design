"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate, useMotionValue, useTransform } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { 
  Target, 
  Lightbulb, 
  Compass, 
  Award, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  MessageSquare
} from 'lucide-react';

const Counter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, { duration: 2, ease: "easeOut" });
      return controls.stop;
    }
  }, [isInView, value, count]);

  useEffect(() => {
    return rounded.on("change", (latest) => setDisplayValue(latest));
  }, [rounded]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
};

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[450px] pt-20 w-full flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1770943558988-2c605d6bd5a7"
          alt="XPRESS DESIGN Office"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="relative z-10 text-center px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white mb-4"
            style={{ fontSize: '48px', fontFamily: 'Playfair Display, serif' }}
          >
            Về chúng tôi
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="flex items-center justify-center space-x-2 text-white/80 text-sm uppercase tracking-widest font-medium mb-6">
              <Link href="/" className="hover:text-[#D4AF37] transition-colors">Trang chủ</Link>
              <span className="text-[#D4AF37]">/</span>
              <span className="text-white">Giới thiệu</span>
            </div>
            <p className="text-white/80 uppercase tracking-[0.3em] text-xs font-bold">
              Câu chuyện và tầm nhìn của Xpress Design
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 
                className="text-[#1A1A1A] mb-8"
                style={{ fontSize: '36px', fontFamily: 'Playfair Display, serif' }}
              >
                Câu chuyện của XPRESS DESIGN
              </h2>
              <div className="space-y-6 text-gray-600 leading-relaxed text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <p>
                  Được thành lập từ niềm đam mê kiến tạo những không gian sống đẳng cấp, XPRESS DESIGN đã trải qua hơn một thập kỷ hình thành và phát triển. Chúng tôi không chỉ xây dựng những ngôi nhà, mà còn tạo nên những kiệt tác nghệ thuật mang đậm dấu ấn cá nhân của từng gia chủ.
                </p>
                <p>
                  Triết lý thiết kế của chúng tôi dựa trên sự cân bằng hoàn hảo giữa tính thẩm mỹ hiện đại và công năng sử dụng tối ưu. Với phong cách Luxury Minimalism, chúng tôi tin rằng sự sang trọng thực sự đến từ sự tinh giản, chất lượng của vật liệu và sự tỉ mỉ trong từng đường nét kiến trúc.
                </p>
                <p>
                  Hành trình của XPRESS DESIGN là hành trình của sự sáng tạo không ngừng nghỉ, luôn đặt sự hài lòng của khách hàng và tính bền vững của công trình lên hàng đầu.
                </p>
              </div>
              
              <div className="mt-12 flex flex-col items-start">
                <p className="text-[#1A1A1A] font-bold italic text-2xl mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Hồng Anh Tú
                </p>
                <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-bold">Founder & Lead Architect</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative z-10 shadow-2xl overflow-hidden rounded-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1679309981674-cef0e23a7864"
                  alt="Architect Story"
                  className="w-full aspect-[4/5] object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 border-t-2 border-r-2 border-[#D4AF37] z-0" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border-b-2 border-l-2 border-[#D4AF37] z-0" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-24 bg-[#F8F9FA]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-12 shadow-sm border-t-4 border-[#D4AF37]"
            >
              <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center text-[#D4AF37] mb-8">
                <Target size={32} />
              </div>
              <h3 
                className="text-[#1A1A1A] mb-4"
                style={{ fontSize: '28px', fontFamily: 'Playfair Display, serif' }}
              >
                Tầm nhìn
              </h3>
              <p className="text-gray-500 leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Trở thành thương hiệu thiết kế kiến trúc và nội thất hàng đầu Việt Nam, được công nhận bởi sự sáng tạo đột phá và tiêu chuẩn chất lượng quốc tế trong phân khúc bất động sản cao cấp.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-[#1A1A1A] p-12 shadow-sm border-t-4 border-[#D4AF37]"
            >
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-[#D4AF37] mb-8">
                <Compass size={32} />
              </div>
              <h3 
                className="text-white mb-4"
                style={{ fontSize: '28px', fontFamily: 'Playfair Display, serif' }}
              >
                Sứ mệnh
              </h3>
              <p className="text-white/60 leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Kiến tạo không gian sống không chỉ để ở, mà để tôn vinh giá trị con người. Chúng tôi cam kết mang lại giải pháp thiết kế thông minh, cá nhân hóa tối đa và bền vững cùng thời gian.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 
              className="text-[#1A1A1A] mb-4"
              style={{ fontSize: '36px', fontFamily: 'Playfair Display, serif' }}
            >
              Giá trị cốt lõi — Điều làm nên XPRESS
            </h2>
            <div className="w-24 h-1 bg-[#D4AF37] mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: <Lightbulb size={32} />, title: "Sáng tạo", desc: "Không ngừng đổi mới, bứt phá mọi giới hạn trong thiết kế." },
              { icon: <ShieldCheck size={32} />, title: "Chất lượng", desc: "Sử dụng vật liệu tốt nhất và quy trình kiểm soát nghiêm ngặt." },
              { icon: <Users size={32} />, title: "Tận tâm", desc: "Lắng nghe và thấu hiểu mọi mong muốn nhỏ nhất của khách hàng." },
              { icon: <Award size={32} />, title: "Uy tín", desc: "Cam kết đúng tiến độ và minh bạch trong mọi khâu triển khai." },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <div className="w-16 h-16 mx-auto bg-[#F8F9FA] rounded-full flex items-center justify-center text-[#1A1A1A] mb-6 group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-500">
                  {item.icon}
                </div>
                <h4 className="text-[#1A1A1A] font-bold uppercase tracking-widest text-sm mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {item.title}
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-[#F8F9FA]">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 
              className="text-[#1A1A1A] mb-4"
              style={{ fontSize: '36px', fontFamily: 'Playfair Display, serif' }}
            >
              Đội ngũ kiến trúc sư — Những người tạo nên khác biệt
            </h2>
            <div className="w-24 h-1 bg-[#D4AF37]" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                name: "Hồng Anh Tú", 
                role: "Founder & Lead Architect", 
                img: "https://images.unsplash.com/photo-1589127114212-b159197ebe6c",
                desc: "Hơn 15 năm kinh nghiệm trong thiết kế biệt thự và penthouse cao cấp."
              },
              { 
                name: "Nguyễn Mai Lan", 
                role: "Senior Interior Designer", 
                img: "https://images.unsplash.com/photo-1619799090425-0efe92bd62a7",
                desc: "Phù thủy không gian với gu thẩm mỹ tinh tế, chuyên về Minimalist Style."
              },
              { 
                name: "Trần Thế Vinh", 
                role: "Technical Manager", 
                img: "https://images.unsplash.com/photo-1765371512992-843e6a92d7e6",
                desc: "Chuyên gia về giải pháp kỹ thuật và thi công công trình hiện đại."
              },
            ].map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center group"
              >
                <div className="w-48 h-48 mx-auto mb-8 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#D4AF37] animate-[spin_10s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-full h-full rounded-full overflow-hidden shadow-xl border-4 border-white">
                    <ImageWithFallback
                      src={member.img}
                      alt={member.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                </div>
                <h4 className="text-xl mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{member.name}</h4>
                <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-bold mb-4">{member.role}</p>
                <p className="text-gray-500 text-sm px-4 leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>{member.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-24 bg-[#1A1A1A] text-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
              { value: 10, suffix: "+", label: "Năm kinh nghiệm" },
              { value: 200, suffix: "+", label: "Dự án hoàn thành" },
              { value: 50, suffix: "+", label: "Đối tác chiến lược" },
              { value: 15, suffix: "+", label: "Giải thưởng thiết kế" },
            ].map((milestone, idx) => (
              <div key={idx}>
                <div 
                  className="text-[#D4AF37] mb-2 font-bold"
                  style={{ fontSize: '48px', fontFamily: 'Playfair Display, serif' }}
                >
                  <Counter value={milestone.value} suffix={milestone.suffix} />
                </div>
                <p className="text-white/50 text-xs uppercase tracking-[0.2em] font-bold">
                  {milestone.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto border-2 border-[#D4AF37] p-16 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <MessageSquare size={120} className="text-[#D4AF37]" />
            </div>
            <h2 
              className="text-[#1A1A1A] mb-8"
              style={{ fontSize: '32px', fontFamily: 'Playfair Display, serif' }}
            >
              Bạn có dự án cần tư vấn?
            </h2>
            <p className="text-gray-500 mb-12 text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Đừng ngần ngại liên hệ với XPRESS DESIGN để nhận được sự hỗ trợ tận tình từ đội ngũ kiến trúc sư chuyên nghiệp.
            </p>
            <Link 
              href="/contact"
              className="bg-[#D4AF37] text-white px-10 py-4 uppercase tracking-[0.2em] text-sm font-bold hover:bg-[#1A1A1A] transition-all duration-300 inline-flex items-center gap-4 group"
            >
              Nhận tư vấn miễn phí
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}