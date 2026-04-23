"use client";

import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, PenTool, Layout, Wrench, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: <MessageSquare size={32} />,
    number: "01",
    title: "Tư vấn & Khảo sát",
    desc: "Lắng nghe nhu cầu và khảo sát thực tế mặt bằng để đưa ra định hướng thiết kế tối ưu nhất.",
  },
  {
    icon: <PenTool size={32} />,
    number: "02",
    title: "Phác thảo ý tưởng",
    desc: "Xây dựng Concept thiết kế 2D và 3D, định hình phong cách và công năng cho không gian.",
  },
  {
    icon: <Layout size={32} />,
    number: "03",
    title: "Thiết kế chi tiết",
    desc: "Hoàn thiện hồ sơ kỹ thuật, bóc tách khối lượng và lựa chọn vật liệu hoàn thiện.",
  },
  {
    icon: <Wrench size={32} />,
    number: "04",
    title: "Thi công",
    desc: "Triển khai thi công chuyên nghiệp, đảm bảo đúng tiến độ và tiêu chuẩn kỹ thuật cao nhất.",
  },
  {
    icon: <CheckCircle size={32} />,
    number: "05",
    title: "Bàn giao & Bảo hành",
    desc: "Nghiệm thu dự án, bàn giao chìa khóa trao tay và cam kết bảo hành lâu dài.",
  },
];

export const Process: React.FC = () => {
  return (
    <section className="bg-[#1A1A1A] py-24 md:py-32 px-6">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20 md:mb-28"
        >
          <h2 
            className="text-white mb-4"
            style={{ fontSize: '36px', fontFamily: 'Playfair Display, serif' }}
          >
            Quy trình làm việc — Từ ý tưởng đến hiện thực
          </h2>
          <div className="w-20 h-1 bg-[#D4AF37] mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 md:gap-8 lg:gap-10">
          {steps.map((step, index) => (
            <motion.div 
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center group"
            >
              {/* Icon & Number Wrapper */}
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#1A1A1A] group-hover:border-[#D4AF37] transition-all duration-500 shadow-lg">
                  {step.icon}
                </div>
                <div 
                  className="absolute -top-2 -right-4 text-[#D4AF37]/30 group-hover:text-[#D4AF37] transition-colors duration-500 font-bold italic"
                  style={{ fontSize: '24px', fontFamily: 'Playfair Display, serif' }}
                >
                  {step.number}
                </div>
              </div>

              {/* Text Info */}
              <h3 
                className="text-white mb-4 uppercase tracking-wider"
                style={{ fontSize: '18px', fontFamily: 'Playfair Display, serif' }}
              >
                {step.title}
              </h3>
              <p 
                className="text-white/50 text-sm leading-relaxed"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};